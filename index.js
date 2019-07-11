window.addEventListener('load', () => {
  const downloadA = document.createElement('a');
  downloadA.textContent = 'Download';
  downloadA.download = 'backup.svg';
  downloadA.href = `data:image/svg+xml,` + document.getElementsByTagName('svg')[0].outerHTML;

  document.body.append(downloadA);
});
