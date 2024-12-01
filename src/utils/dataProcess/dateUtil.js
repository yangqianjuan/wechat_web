// 日期的工具函数
export const getTime = TTime => {
  return TTime ? new Date(TTime).getTime() : new Date().getTime();
};

// 1988/11/12
export const formateDate = (dateStr, separator) => {
  let [year, month, day] = dateStr.split(separator);
  let date = new Date();
  date.setFullYear(year);
  date.setMonth(parseInt(month) - 1);
  date.setDate(parseInt(day));
  return date;
};

export const formateTToDate = (dateStr, separator = '-') => {
  let time = new Date(dateStr);
  let year = time.getFullYear();
  let month = time.getMonth();
  let day = time.getDay();
  return [year, month, day].join(separator);
};
