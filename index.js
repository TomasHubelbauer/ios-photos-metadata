window.addEventListener('load', () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    document.body.append(canvas);

    const context = canvas.getContext('2d');
    context.fillText('TEST', 10, 20);

    const downloadA = document.createElement('a');
    downloadA.textContent = 'Download';
    downloadA.download = 'backup.png';
    downloadA.href = canvas.toDataURL();

    document.body.append(downloadA);
  } catch (error) {
    alert(error.messsage);
  }
});
