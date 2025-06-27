/**
 * 创建配置项行
 * @param {string} label 配置项标签
 * @param {HTMLElement} control 配置控件
 * @returns {HTMLElement} 配置行元素
 */
export function createRow(label, control) {
    const row = document.createElement("div");
    row.style.cssText = `
        display: flex;
        margin-bottom: 10px;
        align-items: center;
        padding: 8px 12px;
        border-radius: 6px;
        background-color: #fafafa;
        border: 1px solid #f0f0f0;
        height: 40px;
        box-sizing: border-box;
    `;
    const labelElem = document.createElement("div");
    labelElem.textContent = label;
    labelElem.style.cssText = `
        flex: 0 0 30%;
        font-size: 14px;
        font-weight: 500;
        color: #333;
    `;
    const controlWrapper = document.createElement("div");
    controlWrapper.style.cssText = `
        flex: 0 0 70%;
        display: flex;
        align-items: center;
    `;
    controlWrapper.appendChild(control);
    row.appendChild(labelElem);
    row.appendChild(controlWrapper);
    return row;
}

/**
 * 创建下拉选择框
 * @param {Object} options 选项对象，键为值，值为显示文本
 * @param {string|number} currentValue 当前值
 * @param {Function} onChangeCallback 值改变时的回调函数
 * @returns {HTMLSelectElement} 下拉选择框元素
 */
export function createSelect(options, currentValue, onChangeCallback) {
    const select = document.createElement("select");
    select.style.cssText = `
        padding: 6px 10px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        min-width: 150px;
        background-color: #fff;
    `;
    for (const [value, text] of Object.entries(options)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        option.selected = value == currentValue;
        select.appendChild(option);
    }
    select.addEventListener("change", () => onChangeCallback(select.value));
    return select;
}

/**
 * 创建颜色选择器
 * @param {number} currentColor 当前颜色值（ARGB格式）
 * @param {Function} onChangeCallback 值改变时的回调函数
 * @returns {HTMLDivElement} 颜色选择器容器元素
 */
export function createColorPicker(currentColor, onChangeCallback) {
    const container = document.createElement("div");
    container.style.cssText = `
        display: flex;
        align-items: center;
    `;
    // 颜色选择器
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.style.cssText = `
        width: 40px;
        height: 25px;
        border: none;
        cursor: pointer;
    `;
    // 从ARGB转换为CSS颜色格式
    const alpha = (currentColor >> 24) & 0xFF;
    const r = (currentColor >> 16) & 0xFF;
    const g = (currentColor >> 8) & 0xFF;
    const b = currentColor & 0xFF;
    colorPicker.value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    // 透明度输入框
    const alphaInput = document.createElement("input");
    alphaInput.type = "number";
    alphaInput.min = 0;
    alphaInput.max = 255;
    alphaInput.value = alpha;
    alphaInput.style.cssText = `
        width: 60px !important;
        min-width: 60px !important;
        padding: 6px 10px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        background-color: #fff;
    `;
    // 透明度标签
    const alphaLabel = document.createElement("span");
    alphaLabel.textContent = "透明度:";
    alphaLabel.style.cssText = `
        margin: 0 10px 0 15px;
        font-size: 13px;
        color: #666;
    `;
    // 更新颜色函数
    const updateColor = () => {
        const hex = colorPicker.value.substring(1);
        const rgb = parseInt(hex, 16);
        const a = parseInt(alphaInput.value) & 0xFF;
        const argb = (a << 24) | rgb;
        onChangeCallback(argb);
    };
    // 添加事件监听
    colorPicker.addEventListener("change", updateColor);
    alphaInput.addEventListener("change", updateColor);
    // 添加到容器
    container.appendChild(colorPicker);
    container.appendChild(alphaLabel);
    container.appendChild(alphaInput);
    return container;
}

/**
 * 创建数字输入框
 * @param {number} currentValue 当前值
 * @param {Function} onChangeCallback 值改变时的回调函数
 * @returns {HTMLInputElement} 数字输入框元素
 */
export function createNumberInput(currentValue, onChangeCallback) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = currentValue;
    input.style.cssText = `
        padding: 6px 10px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        min-width: 150px;
        background-color: #fff;
    `;
    input.addEventListener("change", () => onChangeCallback(parseInt(input.value)));
    return input;
}

/**
 * 创建复选框
 * @param {boolean} checked 是否选中
 * @param {Function} onChangeCallback 值改变时的回调函数
 * @returns {HTMLInputElement} 复选框元素
 */
export function createCheckbox(checked, onChangeCallback) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.style.cssText = `
        width: 16px;
        height: 16px;
        margin-right: 8px;
    `;
    checkbox.addEventListener("change", () => onChangeCallback(checkbox.checked));
    return checkbox;
}

/**
 * 创建配置分类容器
 * @param {string} title 分类标题文本
 * @returns {HTMLElement} 分类容器元素
 */
export function createSection(title) {
    const section = document.createElement("div");
    section.style.cssText = `
        margin-bottom: 20px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        padding: 15px;
        background-color: #fff;
    `;
    // 创建并添加标题
    const sectionTitle = document.createElement("h3");
    sectionTitle.textContent = title;
    sectionTitle.style.cssText = `
        margin-top: 0;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #1890ff;
        color: #1890ff;
        font-size: 16px;
        font-weight: 600;
    `;
    section.appendChild(sectionTitle);
    return section;
}

/**
 * 创建配置界面
 * @returns {HTMLElement} 配置界面元素
 */
export function createConfigView() {
    const container = document.createElement("div");
    container.style.cssText = `
        font-family: 'Microsoft YaHei UI', sans-serif;
        color: #333;
        padding: 0;
        margin: 0;
    `;
    return container;
}
