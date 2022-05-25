export const sleep = (ms = 0) =>
  new Promise(res => {
    setTimeout(res, ms);
  });
