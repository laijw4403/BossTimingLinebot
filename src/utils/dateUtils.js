export const formatDate = (date) => {
  if (!date) return '--';
  
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace(/\//g, '月').replace(',', '日');
}; 