window.addEventListener('load', () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    document.body.append(canvas);

    const context = canvas.getContext('2d');
    context.fillStyle = '#abcdef';
    context.fillRect(0, 0, 100, 100);
    context.strokeStyle = '#0080ff';
    context.font = 'normal 100px sans-serif';
    context.strokeText(':-)', 0, 75);

    canvas.toBlob(blob => {
      canvas.remove();

      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        /** @type {ArrayBuffer} */
        const arrayBuffer = fileReader.result;
        const pngChunks = arrayBuffer.slice(0, -8);
        const iendChunk = arrayBuffer.slice(-8);

        // https://www.w3.org/TR/2003/REC-PNG-20031110/#11tEXt
        const textChunkWithoutLengthAndCrc = new Uint8Array([
          //0x00, 0x00, 0x00, 0x00, // Length of data field
          0x74, 0x45, 0x58, 0x74, // tEXt
          // 0 bytes of data
          // CRC will be appended
        ]);

        const dataView = new DataView(textChunkWithoutLengthAndCrc.buffer);

        const crcPart = new Uint8Array(4);
        const dv = new DataView(crcPart.buffer);
        dv.setUint32(0, crc(dataView, dataView.byteLength));

        const textChunk = new Uint8Array(
          [
            0x00, 0x00, 0x00, 0x00, // Length of the data
            ...textChunkWithoutLengthAndCrc,
            ...crcPart, // CRC
          ]
        );

        console.log(textChunk);

        const uint8Array = new Uint8Array(pngChunks.byteLength + textChunk.byteLength + iendChunk.byteLength);
        uint8Array.set(new Uint8Array(pngChunks), 0);
        uint8Array.set(new Uint8Array(textChunk), pngChunks.byteLength);
        uint8Array.set(new Uint8Array(iendChunk), pngChunks.byteLength + textChunk.byteLength);

        const newBlob = new Blob([uint8Array], { type: blob.type });

        const newFileReader = new FileReader();
        newFileReader.addEventListener('load', () => render(newFileReader.result));
        newFileReader.readAsDataURL(newBlob);

        render(URL.createObjectURL(newBlob));
      });

      fileReader.readAsArrayBuffer(blob);
    });
  } catch (error) {
    alert(error.messsage + '\n' + error.toString());
  }
});

function render(url) {
  const previewImg = document.createElement('img');
  previewImg.src = url;
  previewImg.title = url;

  const downloadA = document.createElement('a');
  downloadA.href = url;
  downloadA.append(previewImg);

  document.body.append(downloadA);
}

// https://github.com/image-js/fast-png/blob/master/src/common.ts
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
function updateCrc(crc, data, length) {
  let c = crc;
  for (let n = 0; n < length; n++) {
    c = crcTable[(c ^ data[n]) & 0xff] ^ (c >>> 8);
  }
  return c;
}

function crc(data, length) {
  return (updateCrc(initialCrc, data, length) ^ initialCrc) >>> 0;
}
