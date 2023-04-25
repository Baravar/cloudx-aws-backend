export const catalogBatchProcess = async event => {
  console.log(event);
  console.log('QUEUE_URL: ', process.env.QUEUE_URL);
  event.Records.forEach(record => {
    console.log(record);
  });
};

export default catalogBatchProcess;
