export const downloadCSV = (
  data: object[],
  headings: string[],
  filename: string,
  delimiter = ',',
) => {
  const csvContent = [
    headings.join(delimiter),
    ...data.map((row) => Object.values(row).join(delimiter)),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
