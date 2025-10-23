import * as xlsx from 'xlsx';
import type { WorkBook } from 'xlsx';
import type { JsonToSheet, AoAToSheet } from './typing';
import { AoaToMultipleSheet, JsonToMultipleSheet } from './typing';

const { utils, writeFile } = xlsx;

const DEF_FILE_NAME = 'excel-list.xlsx';
const DEF_SHEET_NAME = 'sheet';

/**
 * @param data source data
 * @param worksheet worksheet object
 * @param min min width
 */
function setColumnWidth(data, worksheet, min = 10) {
  const obj = {};
  worksheet['!cols'] = [];
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const cur = item[key];
      const length = cur?.length ?? min;
      obj[key] = Math.max(length, obj[key] ?? min);
    });
  });
  Object.keys(obj).forEach((key) => {
    worksheet['!cols'].push({
      wch: obj[key],
    });
  });
}
// 行高设置
function setRowHeight_OutputCIP(data, worksheet, min = 30) {
  worksheet['!rows'] = [];
  const arrLength = data.length + 1;
  for (let start_line = 0; start_line < arrLength; start_line++) {
    worksheet['!rows'].push({
      hpt: min,
    });
  }
}
// 列宽设置
function setColumnWidth_OutputCIP(data, worksheet, diyColumnConfig, min = 10) {
  worksheet['!cols'] = [];
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const cur = item[key];
      const length = cur?.length ?? min;
      diyColumnConfig[key] = diyColumnConfig[key] || Math.max(length, diyColumnConfig[key] ?? min);
    });
  });
  Object.keys(diyColumnConfig).forEach((key) => {
    worksheet['!cols'].push({
      wch: diyColumnConfig[key],
    });
  });
}

export function jsonToSheetXlsx<T = any>({
  data,
  header,
  filename = DEF_FILE_NAME,
  sheetName = DEF_SHEET_NAME,
  json2sheetOpts = {},
  write2excelOpts = { bookType: 'xlsx' },
  diyColumnConfig,
}: JsonToSheet<T>) {
  const arrData = [...data];
  if (header) {
    arrData.unshift(header);
    json2sheetOpts.skipHeader = true;
  }

  const worksheet = utils.json_to_sheet(arrData, json2sheetOpts);
  if (diyColumnConfig) {
    setColumnWidth_OutputCIP(arrData, worksheet, diyColumnConfig);
    setRowHeight_OutputCIP(arrData, worksheet, 30);
    // setRowHeight_OutputCIP(arrData, worksheet);
  } else {
    setColumnWidth(arrData, worksheet);
  }
  /* add worksheet to workbook */
  const workbook: WorkBook = {
    SheetNames: [sheetName],
    Sheets: {
      [sheetName]: worksheet,
    },
  };
  /* output format determined by filename */
  writeFile(workbook, filename, write2excelOpts);
  /* at this point, out.xlsb will have been downloaded */
}

export function aoaToSheetXlsx<T = any>({
  data,
  header,
  filename = DEF_FILE_NAME,
  write2excelOpts = { bookType: 'xlsx' },
}: AoAToSheet<T>) {
  const arrData = [...data];
  if (header) {
    arrData.unshift(header);
  }

  const worksheet = utils.aoa_to_sheet(arrData);

  /* add worksheet to workbook */
  const workbook: WorkBook = {
    SheetNames: [filename],
    Sheets: {
      [filename]: worksheet,
    },
  };
  /* output format determined by filename */
  writeFile(workbook, filename, write2excelOpts);
  /* at this point, out.xlsb will have been downloaded */
}

/**
 * json导出多Sheet的Xlsx
 * @param sheetList 多sheet配置
 * @param filename 文件名(包含后缀)
 * @param write2excelOpts 文件配置
 */
export function jsonToMultipleSheetXlsx<T = any>({
  sheetList,
  filename = DEF_FILE_NAME,
  write2excelOpts = { bookType: 'xlsx' },
}: JsonToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {},
  };
  sheetList.forEach((p, index) => {
    const arrData = [...p.data];
    if (p.header) {
      arrData.unshift(p.header);
      p.json2sheetOpts = p.json2sheetOpts || {};
      p.json2sheetOpts.skipHeader = true;
    }

    const worksheet = utils.json_to_sheet(arrData, p.json2sheetOpts);
    setColumnWidth(arrData, worksheet);

    p.sheetName = p.sheetName || `${DEF_SHEET_NAME}${index}`;
    workbook.SheetNames.push(p.sheetName);
    workbook.Sheets[p.sheetName] = worksheet;
  });
  writeFile(workbook, filename, write2excelOpts);
}

/**
 * aoa导出多Sheet的Xlsx
 * @param sheetList 多sheet配置
 * @param filename 文件名(包含后缀)
 * @param write2excelOpts 文件配置
 */
export function aoaToMultipleSheetXlsx<T = any>({
  sheetList,
  filename = DEF_FILE_NAME,
  write2excelOpts = { bookType: 'xlsx' },
}: AoaToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {},
  };
  sheetList.forEach((p, index) => {
    const arrData = [...p.data];
    if (p.header) {
      arrData.unshift(p.header);
    }
    const worksheet = utils.aoa_to_sheet(arrData);

    p.sheetName = p.sheetName || `${DEF_SHEET_NAME}${index}`;
    workbook.SheetNames.push(p.sheetName);
    workbook.Sheets[p.sheetName] = worksheet;
  });
  /* output format determined by filename */
  writeFile(workbook, filename, write2excelOpts);
  /* at this point, out.xlsb will have been downloaded */
}
