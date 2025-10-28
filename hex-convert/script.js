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
        
        // 执行转换
        document.getElementById('binary').value = decimalValue.toString(2);
        document.getElementById('octal').value = decimalValue.toString(8);
        document.getElementById('decimal').value = decimalValue.toString(10);
        document.getElementById('hexadecimal').value = '0x' + hexString.toUpperCase();
        document.getElementById('base32').value = convertToBase(decimalValue, 32);
        document.getElementById('base64').value = convertToBase(decimalValue, 64);
        
    } catch (error) {
        errorMessage.textContent = error.message || '转换失败，请检查输入格式！';
        errorMessage.classList.add('show');
    }
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

// 支持回车键触发转换
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('hexInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            convertHex();
        }
    });
});
