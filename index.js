window.addEventListener('load', () => {
  const downloadA = document.createElement('a');
  downloadA.textContent = 'Download';
  downloadA.download = 'backup.png';
  downloadA.href = `data:image/png,TEST`;

  document.body.append(downloadA);
});
