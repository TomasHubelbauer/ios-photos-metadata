window.addEventListener('load', () => {
  renderIntro();
});

function renderIntro() {
  const introP = document.createElement('p');
  introP.textContent = 'This app will generate an image with application data in its metadata.';
  const downloadP = document.createElement('p');
  downloadP.textContent = 'Download it and upload it again to see if the metadata has been preserved.';
  const sizeInput = document.createElement('input');
  sizeInput.type = 'number';
  sizeInput.placeholder = 'Payload size (B)';
  const generateButton = document.createElement('button');
  generateButton.textContent = 'Generate';
  generateButton.addEventListener('click', async () => {
    const size = sizeInput.valueAsNumber || 0;
    const generatingP = document.createElement('p');
    generatingP.textContent = 'Generating…';
    document.body.append(generatingP);
    const { url, index, length } = await generate(size);
    renderGenerated(url, index, length);
  });

  sizeInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      generateButton.click();
    }
  });

  document.body.innerHTML = '';
  document.body.append(introP, downloadP, sizeInput, generateButton);
}

function renderGenerated(url, index, length) {
  const previewImg = document.createElement('img');
  previewImg.src = url;
  const infoP = document.createElement('p');
  infoP.textContent = 'The image contains application data in its metadata.';
  const downloadP = document.createElement('p');
  downloadP.textContent = 'Download it to Photos by long-pressing on it and selecting Save Image.';
  const uploadP = document.createElement('p');
  uploadP.textContent = 'Upload it back to see if the data was preserved by the Photos app/iOS:';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.addEventListener('change', () => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(fileInput.files[0]);
    fileReader.addEventListener('load', () => {
      try {
        validate(fileReader.result, index, length);
        renderValidated();
      } catch (error) {
        renderValidated(error);
      }
    });
  });

  document.body.innerHTML = '';
  document.body.append(previewImg, infoP, downloadP, uploadP, fileInput);
}

function renderValidated(error) {
  document.body.innerHTML = error || `The metadata were left intact!`;
}

function generate(/** @type {Number} */ size) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext('2d');
  context.fillStyle = '#abcdef';
  context.fillRect(0, 0, 256, 256);
  context.fillStyle = '#000';
  context.font = 'normal 20px sans-serif';
  context.fillText('This image contains', 10, 30);
  context.fillText('application data in its', 10, 50);
  context.fillText('metadata.', 10, 70);
  context.fillText('The purpose of it is to', 10, 110);
  context.fillText('see if iOS / the Photos', 10, 130);
  context.fillText('app will preserve them.', 10, 150);
  context.fillText(':-)', 10, 190);
  context.fillText(new Date().toLocaleString(), 10, 245);

  let promiseResolve;
  let promiseReject;

  const fileReader = new FileReader();
  fileReader.addEventListener('load', () => {
    try {
      /** @type {ArrayBuffer} */
      const arrayBuffer = fileReader.result;
      const pngChunks = new Uint8Array(arrayBuffer.slice(0, -12));
      const iendChunk = new Uint8Array(arrayBuffer.slice(-12));

      const keyword = [...'Comment'].map(c => c.charCodeAt(0));

      const dataUint8Array = new Uint8Array(4 + keyword.length + 1 + size);
      dataUint8Array.set([0x74, 0x45, 0x58, 0x74], 0);
      dataUint8Array.set(keyword, 4);
      dataUint8Array.set([0x0], 4 + keyword.length);
      for (let index = 0; index < size; index++) {
        dataUint8Array.set([95 /* Underscore */], 4 + keyword.length + 1 + index);
      }

      const lengthUnit8Array = new Uint8Array(4);
      const lengthdataView = new DataView(lengthUnit8Array.buffer);
      lengthdataView.setUint32(0, dataUint8Array.length - 4);

      const crcUnit8Array = new Uint8Array(4);
      const crcDataView = new DataView(crcUnit8Array.buffer);
      crcDataView.setUint32(0, crc(dataUint8Array, dataUint8Array.byteLength));

      // https://www.w3.org/TR/2003/REC-PNG-20031110/#11tEXt
      const textChunk = new Uint8Array([...lengthUnit8Array, ...dataUint8Array, ...crcUnit8Array]);

      const uint8Array = new Uint8Array(pngChunks.byteLength + textChunk.byteLength + iendChunk.byteLength);
      uint8Array.set(pngChunks, 0);
      uint8Array.set(textChunk, pngChunks.byteLength);
      uint8Array.set(iendChunk, pngChunks.byteLength + textChunk.byteLength);

      promiseResolve({
        url: URL.createObjectURL(new Blob([uint8Array])),
        index: pngChunks.byteLength + 4,
        length: dataUint8Array.length,
      });
    } catch (error) {
      promiseReject(error);
    }
  });

  canvas.toBlob(blob => fileReader.readAsArrayBuffer(blob));
  return new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });
}

function validate(/** @type {ArrayBuffer} */ arrayBuffer, /** @type {Number} */ position, /** @type {Number} */ size) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let index = 0;
  while (index < arrayBuffer.byteLength) {
    if (uint8Array[index] === 0x74 && uint8Array[index + 1] === 0x45 && uint8Array[index + 2] === 0x58 && uint8Array[index + 3] === 0x74) {
      break;
    }

    index++;
  }

  if (index === arrayBuffer.byteLength) {
    throw new Error('No tEXt chunk was found in the image.');
  }

  const lengthDataView = new DataView(arrayBuffer, index - 4, 4);
  const length = lengthDataView.getUint32(0);

  if (index !== position) {
    throw new Error('The tEXt chunk was found at a different index.');
  }

  if (length + 4 !== size) {
    throw new Error('The tEXt chunk length does not match.');
  }

  const slice = new Uint8Array(arrayBuffer, index + 4 + 'Comment\0'.length, length - 'Comment\0'.length);
  for (let byte of slice) {
    if (byte !== 95 /* Underscore */) {
      throw new Error('The tEXt chunk contents do not match!');
    }
  }
}

/* https://github.com/image-js/fast-png/blob/master/src/common.ts */

/** @type {Number[]} */
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

const initialCrc = 0xffffffff;
function updateCrc(/** @type {Number} */ crc, /** @type {Uint8Array} */ data, /** @type {Number} */ length) {
  let c = crc;
  for (let n = 0; n < length; n++) {
    c = crcTable[(c ^ data[n]) & 0xff] ^ (c >>> 8);
  }
  return c;
}

function crc(/** @type {Uint8Array} */ data, /** @type {Number} */ length) {
  return (updateCrc(initialCrc, data, length) ^ initialCrc) >>> 0;
}
