const REGID_CARD = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
const CHART_NUMBER = /^[A-Za-z0-9]+$/;
const WINDOWS_PATH = /^[a-zA-Z]:/;
// 全局匹配一个或多个空白字符（包括空格、制表符、换行符等）
const VALID_CHART = /\s+/g
const IS_DATE = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;

const BINARY = "binary";
const _XLSX = "xlsx";
const PXLSX = ".xlsx";
// application/octet-stream 是一种MIME类型，用于表示任意的二进制数据流。
const OCTET_STREAM = "application/octet-stream";
const SHEET_NAME = "sheet0";

// 辅助函数，将字符串转换为ArrayBuffer
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}


class ExcelObjectParent {

    argumentsConstructor(argList) {
        var i = 0;
        for (let key in this) {
            this[key] = argList[i++];
        }
    }

    verify() {
        try {
            return this.doVerify();
        } catch (error) {
            console.log(this);
            console.log(error); 
            return false;
        }
    }

    correct() {
        try {
            this.doCorrect();
        } catch (error) {
            console.log(this);
            console.log(error); 
        }
    }

    doVerify() {
        return true;
    }

    doCorrect() {
        return;
    }

}


class FileHandler {
    constructor() {
        this.datas = [];
    }

    handleDatas(datas) {
    }


    handleFile(event) {
        const files = event.target.files;
        console.log(files);
        this.readData(files, 0, this);
    }

    readData(files, i, handler) {
        const reader = new FileReader();

        reader.onload = function(e) {
            handler.datas.push(e.target.result);

            if (i+1 == files.length) {
                handler.handleDatas(handler.datas);
            } else {
                handler.readData(files, i+1, handler);
            }
        };

        reader.readAsBinaryString(files[i]);
        console.log(files[i].name);
    }

}


function getTimeStamp() {
    const now = new Date();
    const year = now.getFullYear(); // 获取年份
    const month = now.getMonth() + 1; // 获取月份，注意月份是从0开始的，所以需要加1
    const day = now.getDate(); // 获取日期
    const hours = now.getHours(); // 获取小时
    const minutes = now.getMinutes(); // 获取分钟
    const seconds = now.getSeconds(); // 获取秒

    return year + "-" + month + "-" + day + " " + hours + "-" + minutes + "-" + seconds;
}

function formatDateString(dateStr, separator, yearPrefix) {
    // 将字符串按"."分割成数组
    const parts = dateStr.split(separator);

    // 确保数组长度为3（年、月、日）
    if (parts.length !== 3) {
        return dateStr;
    }

    // 年份部分前补"20"
    const year = parts[0].padStart(4, yearPrefix);

    // 月和日部分补足两位数字
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');

    // 拼接成最终的格式
    return `${year}${separator}${month}${separator}${day}`;
}

function formatDateStringBySeparator(dateStr, oriSeparator, desSeparator, yearPrefix) {
    // 将字符串按"."分割成数组
    const parts = dateStr.split(oriSeparator);

    // 确保数组长度为3（年、月、日）
    if (parts.length !== 3) {
        return dateStr;
    }

    // 年份部分前补"20"
    const year = parts[0].padStart(4, yearPrefix);

    // 月和日部分补足两位数字
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');

    // 拼接成最终的格式
    return `${year}${desSeparator}${month}${desSeparator}${day}`;
}

function isValidStr(str) {
    return !(str == null || str == undefined || str.trim() == "");
}

function convertExcelDateToJSDate(excelDate) {
    // 1900年1月1日到1970年1月1日的天数
    const excelBaseDate = 25569;
    // 一天的毫秒数
    const msPerDay = 86400000;

    // 将Excel日期序列号转换为JavaScript日期的毫秒数
    const jsDate = new Date((excelDate - excelBaseDate) * msPerDay);

    // 输出本地化格式：YYYY/MM/DD
    return formatDateString(jsDate.toLocaleDateString("zh-CN"), "/", "20");
}
