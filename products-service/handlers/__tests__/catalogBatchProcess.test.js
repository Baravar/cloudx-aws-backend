import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { catalogBatchProcess } from '../catalogBatchProcess.js';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('catalogBatchProcess', () => {
  uuidv4.mockImplementation(() => 'mocked_uuid');

  it('should send SNS event per each item in SQS batch', async () => {
    const SNSClientMock = mockClient(SNSClient);
    const SQSEventMock = {
      Records: [
        {
          body: '{"count":"1","title":"FC Barcelona. - Home Kit 22-23","description":"Home jersey","image":"someURL","price":"90","size":"S,M,L"}'
        },
        {
          body: '{"count":"5","title":"Man City - Home Kit 22-23","description":"Home jersey","image":"someURL","price":"70.5","size":"M"}'
        }
      ]
    };

    await catalogBatchProcess(SQSEventMock);

    await expect(SNSClientMock).toHaveReceivedCommandTimes(PublishCommand, 2);
    await expect(SNSClientMock).toHaveReceivedNthCommandWith(
      1,
      PublishCommand,
      {
        Message:
          '"FC Barcelona. - Home Kit 22-23" product has been added to the Store DB tables with the id [ mocked_uuid ]',
        MessageAttributes: {
          notify: { DataType: 'String', StringValue: 'false' }
        },
        Subject: 'CloudX - New Product added to the Store DB',
        TopicArn: undefined
      }
    );
    await expect(SNSClientMock).toHaveReceivedNthCommandWith(
      2,
      PublishCommand,
      {
        Message:
          '"Man City - Home Kit 22-23" product has been added to the Store DB tables with the id [ mocked_uuid ]',
        MessageAttributes: {
          notify: { DataType: 'String', StringValue: 'false' }
        },
        Subject: 'CloudX - New Product added to the Store DB',
        TopicArn: undefined
      }
    );
  });

  it('should set "notify" Message Attribute depending on Count - it is used to direct SNS Event to different Subscribers', async () => {
    const SNSClientMock = mockClient(SNSClient);
    const SQSEventMock = {
      Records: [
        {
          body: '{"count":"1","title":"FC Barcelona. - Home Kit 22-23","description":"Home jersey","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOQ3Z_ga0tYIX-jwq6F1AlrK8aPtXyoQNtQrkJ-8nv4G6ldqK3IviuRFETxCvRAwGuobo7fUMr8LT-gBBPDObnUG9k6Yj_dVzTo0c4MEzmD2ScvDTPZthVAUbBZWdR89WubE7iKvkrTYDkpI7VAW78WqHXPSIy9vkWlas4fVStXk9kvikdNgQgA4l06A/s1600/Atl%C3%A9tico%20Madrid%2022-23%20Home%20&%20Away%20Kits%20%20%286%29.jpg","price":"90","size":"S,M,L"}'
        },
        {
          body: '{"count":"0","title":"Man City - Home Kit 22-23","description":"Home jersey","image":"https://shop.mancity.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog-MAN/default/dw96c87297/images/large/701221508001_pp_01_mcfc.png?sw=1600&sh=1600&sm=fit","price":"70.5","size":"M"}'
        }
      ]
    };

    await catalogBatchProcess(SQSEventMock);

    await expect(SNSClientMock).toHaveReceivedNthCommandWith(
      1,
      PublishCommand,
      {
        Message:
          '"FC Barcelona. - Home Kit 22-23" product has been added to the Store DB tables with the id [ mocked_uuid ]',
        MessageAttributes: {
          notify: { DataType: 'String', StringValue: 'false' }
        },
        Subject: 'CloudX - New Product added to the Store DB',
        TopicArn: undefined
      }
    );
    await expect(SNSClientMock).toHaveReceivedNthCommandWith(
      2,
      PublishCommand,
      {
        Message:
          '"Man City - Home Kit 22-23" product has been added to the Store DB tables with the id [ mocked_uuid ]',
        MessageAttributes: {
          notify: { DataType: 'String', StringValue: 'true' }
        },
        Subject: 'CloudX - New Product added to the Store DB',
        TopicArn: undefined
      }
    );
  });

  it('should NOT send SNS event in case of corrupted product data / missing fields', async () => {
    const SNSClientMock = mockClient(SNSClient);
    const SQSEventMock = {
      Records: [
        {
          body: '{"title":"FC Barcelona. - Home Kit 22-23","description":"Home jersey","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOQ3Z_ga0tYIX-jwq6F1AlrK8aPtXyoQNtQrkJ-8nv4G6ldqK3IviuRFETxCvRAwGuobo7fUMr8LT-gBBPDObnUG9k6Yj_dVzTo0c4MEzmD2ScvDTPZthVAUbBZWdR89WubE7iKvkrTYDkpI7VAW78WqHXPSIy9vkWlas4fVStXk9kvikdNgQgA4l06A/s1600/Atl%C3%A9tico%20Madrid%2022-23%20Home%20&%20Away%20Kits%20%20%286%29.jpg","price":"90","size":"S,M,L"}'
        }
      ]
    };

    await catalogBatchProcess(SQSEventMock).catch(
      e => {
        expect(e).toEqual(
          'This request is missing payload or required field - count'
        );
      }
    );
    await expect(SNSClientMock).toHaveReceivedCommandTimes(PublishCommand, 0);

  });

  it('should report error on failure attempting to send SNS event', async () => {
    const SNSClientMock = mockClient(SNSClient);
    const SQSEventMock = {
      Records: [
        {
          body: '{"count":"1", "title":"FC Barcelona. - Home Kit 22-23","description":"Home jersey","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOQ3Z_ga0tYIX-jwq6F1AlrK8aPtXyoQNtQrkJ-8nv4G6ldqK3IviuRFETxCvRAwGuobo7fUMr8LT-gBBPDObnUG9k6Yj_dVzTo0c4MEzmD2ScvDTPZthVAUbBZWdR89WubE7iKvkrTYDkpI7VAW78WqHXPSIy9vkWlas4fVStXk9kvikdNgQgA4l06A/s1600/Atl%C3%A9tico%20Madrid%2022-23%20Home%20&%20Away%20Kits%20%20%286%29.jpg","price":"90","size":"S,M,L"}'
        }
      ]
    };
    SNSClientMock.on(PublishCommand).rejects({stack: 'SNS publishing error'});
    await catalogBatchProcess(SQSEventMock).catch(e => {
      expect(e).toEqual('SNS publishing error');
    });
    await expect(SNSClientMock).toHaveReceivedCommandTimes(PublishCommand, 1);
  });
});
