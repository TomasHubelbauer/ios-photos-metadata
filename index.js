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

    const previewImg = document.createElement('img');
    previewImg.src = canvas.toDataURL();

    const downloadA = document.createElement('a');
    downloadA.href = canvas.toDataURL();
    downloadA.append(previewImg);

    document.body.append(downloadA);

    canvas.remove();
  } catch (error) {
    alert(error.messsage);
  }
});
