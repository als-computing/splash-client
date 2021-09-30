export default async function dataToParent({ thisObj, data } = {}) {
  // This emits an object with the altered data, and
  // a callback for the parent component to call with a boolean as the argument,
  // so that this component can know whether not the data was saved succesfully
  // if the data was succesfully saved then the code will execute as normal.
  // if not then this function will throw an error
  // Partly inspired by how this programmer awaits a settimeout https://stackoverflow.com/a/51939030/8903570
  return new Promise((resolve, reject) => thisObj.$emit('dataToParent', {
    data,
    callback: ({ success, displayMessage } = {}) => {
      if (success) {
        resolve();
      } else {
        const e = new Error();
        e.displayMessage = displayMessage;
        reject(e);
      }
    },
  }));
}
