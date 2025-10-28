function parseHexInput(input) {
    // 移除所有空格
    let cleaned = input.replace(/\s+/g, '');
    
    // 移除0x或0X前缀
    cleaned = cleaned.replace(/^0x/i, '');
    
    // 验证是否只包含有效的16进制字符
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
        throw new Error('输入包含无效的16进制字符！');
    }
    
    return cleaned;
}

function convertToBase(number, base) {
    if (base <= 36) {
        return number.toString(base).toUpperCase();
    }
    
    // 对于大于36的进制，使用自定义字符集
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
    if (number === 0n) return '0';
    
    let result = '';
    let num = number;
    
    while (num > 0n) {
        result = chars[Number(num % BigInt(base))] + result;
        num = num / BigInt(base);
    }
    
    return result;
}

function convertHex() {
    const input = document.getElementById('hexInput').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    // 清除之前的错误消息
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    // 清空所有结果框
    document.getElementById('binary').value = '';
    document.getElementById('octal').value = '';
    document.getElementById('decimal').value = '';
    document.getElementById('hexadecimal').value = '';
    document.getElementById('base32').value = '';
    document.getElementById('base64').value = '';
    document.getElementById('ascii').value = '';
    document.getElementById('byteArray').value = '';
    document.getElementById('utf8').value = '';
    
    if (!input) {
        errorMessage.textContent = '请输入16进制数值！';
        errorMessage.classList.add('show');
        return;
    }
    
    try {
        // 解析输入
        const hexString = parseHexInput(input);
        
        // 转换为BigInt以支持大数
        const decimalValue = BigInt('0x' + hexString);
        
        // 执行基本转换
        document.getElementById('binary').value = decimalValue.toString(2);
        document.getElementById('octal').value = decimalValue.toString(8);
        document.getElementById('decimal').value = decimalValue.toString(10);
        document.getElementById('hexadecimal').value = '0x' + hexString.toUpperCase();
        document.getElementById('base32').value = convertToBase(decimalValue, 32);
        document.getElementById('base64').value = convertToBase(decimalValue, 64);
        
        // ASCII转换
        const asciiResult = convertToASCII(hexString);
        document.getElementById('ascii').value = asciiResult;
        
        // 字节数组转换
        const byteArrayResult = convertToByteArray(hexString);
        document.getElementById('byteArray').value = byteArrayResult;
        
        // UTF-8编码转换
        const utf8Result = convertToUTF8(asciiResult);
        document.getElementById('utf8').value = utf8Result;
        
    } catch (error) {
        errorMessage.textContent = error.message || '转换失败，请检查输入格式！';
        errorMessage.classList.add('show');
    }
}

function convertToASCII(hexString) {
    // 确保十六进制字符串长度为偶数
    if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
    }
    
    let result = '';
    let byteCount = 0;
    
    for (let i = 0; i < hexString.length; i += 2) {
        const hexByte = hexString.substr(i, 2);
        const byte = parseInt(hexByte, 16);
        
        byteCount++;
        
        // ASCII控制字符和特殊字符处理
        if (byte === 0x00) {
            result += '[NUL]';
        } else if (byte === 0x09) {
            result += '[TAB]';
        } else if (byte === 0x0A) {
            result += '[LF]\n';
        } else if (byte === 0x0D) {
            result += '[CR]';
        } else if (byte === 0x1B) {
            result += '[ESC]';
        } else if (byte === 0x20) {
            result += ' ';
        } else if (byte === 0x7F) {
            result += '[DEL]';
        } else if (byte < 0x20 || byte > 0x7E) {
            // 非可打印字符，显示十六进制
            result += `[0x${hexByte.toUpperCase()}]`;
        } else {
            // 可打印ASCII字符
            result += String.fromCharCode(byte);
        }
    }
    
    return result || '（无法解析为ASCII）';
}

function convertToByteArray(hexString) {
    // 确保十六进制字符串长度为偶数
    if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
    }
    
    let bytes = [];
    
    for (let i = 0; i < hexString.length; i += 2) {
        const hexByte = hexString.substr(i, 2);
        const byte = parseInt(hexByte, 16);
        bytes.push(byte);
    }
    
    // 格式化输出
    let result = '[';
    for (let i = 0; i < bytes.length; i++) {
        result += bytes[i];
        if (i < bytes.length - 1) {
            result += ', ';
        }
        // 每16个字节换行
        if ((i + 1) % 16 === 0 && i < bytes.length - 1) {
            result += '\n ';
        }
    }
    result += ']';
    
    return result;
}

function convertToUTF8(asciiText) {
    // 移除所有特殊标记，只保留可打印字符
    let cleanText = asciiText.replace(/\[[^\]]+\]/g, '');
    
    if (!cleanText.trim()) {
        return '（无有效文本）';
    }
    
    // 将文本转换为UTF-8字节
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(cleanText);
    
    // 转换为十六进制表示
    let result = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
        result += utf8Bytes[i].toString(16).toUpperCase().padStart(2, '0');
        if (i < utf8Bytes.length - 1) {
            result += ' ';
        }
        // 每16个字节换行
        if ((i + 1) % 16 === 0 && i < utf8Bytes.length - 1) {
            result += '\n';
        }
    }
    
    return result;
}

function copyToClipboard(elementId, button) {
    const element = document.getElementById(elementId);
    const text = element.value;
    
    if (!text) {
        return;
    }
    
    // 复制到剪贴板
    navigator.clipboard.writeText(text).then(() => {
        // 改变按钮状态
        const originalText = button.textContent;
        button.textContent = '✓ 已复制';
        button.classList.add('copied');
        
        // 2秒后恢复
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}
