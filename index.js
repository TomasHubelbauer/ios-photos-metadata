window.addEventListener('load', () => {
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

  const size = 1000;
  const data = JSON.stringify({ test: 'TEST'.repeat(size) });

  const fileReader = new FileReader();
  fileReader.addEventListener('load', () => {
    /** @type {ArrayBuffer} */
    const arrayBuffer = fileReader.result;
    const pngChunks = new Uint8Array(arrayBuffer.slice(0, -12));
    const iendChunk = new Uint8Array(arrayBuffer.slice(-12));

    const keyword = [...'Comment'].map(c => c.charCodeAt(0));
    const payload = [...data].map(c => c.charCodeAt(0));

    const dataUint8Array = new Uint8Array(4 + keyword.length + 1 + payload.length);
    dataUint8Array.set([0x74, 0x45, 0x58, 0x74], 0);
    dataUint8Array.set(keyword, 4);
    dataUint8Array.set([0x0], 4 + keyword.length);
    dataUint8Array.set(payload, 4 + keyword.length + 1);

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

    document.body.append(document.createTextNode(`A tEXt chunk placed at index ${pngChunks.byteLength + 4} with length of ${dataUint8Array.length}.`));

    const previewImg = document.getElementById('previewImg');
    previewImg.src = URL.createObjectURL(new Blob([uint8Array]));

    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', () => {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        /** @type {ArrayBuffer} */
        const arrayBuffer = fileReader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        let index = 0;
        while (index < arrayBuffer.byteLength) {
          if (uint8Array[index] === 0x74 && uint8Array[index + 1] === 0x45 && uint8Array[index + 2] === 0x58 && uint8Array[index + 3] === 0x74) {
            break;
          }

          index++;
        }

        if (index === arrayBuffer.byteLength) {
          document.body.append(document.createTextNode('No tEXt chunk was found in the image.'));
          return;
        }

        const lengthDataView = new DataView(arrayBuffer, index - 4, 4);
        const length = lengthDataView.getUint32(0);
        document.body.append(document.createTextNode(`tEXt chunk found at index ${index + 4}! Length: ${length}.`));

        const slice = new Uint8Array(arrayBuffer, index + 4 + keyword.length + 1, length - keyword.length - 1);
        const text = String.fromCharCode(...slice);
        document.body.append(document.createTextNode(text === data ? `The metadata of length ${text.length} match!!!` : 'The metadata DO NOT MATCH!'));
      });

      fileReader.readAsArrayBuffer(fileInput.files[0]);
      fileInput.remove();
    });
  });

  canvas.toBlob(blob => fileReader.readAsArrayBuffer(blob));
});

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
