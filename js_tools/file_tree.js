const myFileTreeData = "myFileTreeData";

class TreeNode {
    constructor(path) {
        // 处理 Windows 路径，统一转换为正斜杠
        path = path.replace(/\\/g, '/');
        this.name = path.split('/').pop();
        this.path = path;
        this.children = new Map();
        this.isFile = true;
    }
}

class FileTree {
    constructor() {
        this.root = new TreeNode('root');
        this.root.isFile = false;
    }

    addPath(path) {
        // 处理 Windows 路径，统一转换为正斜杠
        path = path.replace(/\\/g, '/');
        
        // Windows 路径特殊处理（如 C:/Users/...）
        const isWindowsPath = /^[a-zA-Z]:/i.test(path);
        
        // 对于非 Windows 路径，确保以 / 开头
        if (!isWindowsPath && !path.startsWith('/')) {
            path = '/' + path;
        }
        
        const parts = path.split('/').filter(part => part);
        let current = this.root;

        // 如果是 Windows 路径，将盘符作为第一级目录
        if (isWindowsPath) {
            const driveLetter = parts[0];
            if (!current.children.has(driveLetter)) {
                const node = new TreeNode(driveLetter);
                node.isFile = false;
                current.children.set(driveLetter, node);
            }
            current = current.children.get(driveLetter);
            parts.shift(); // 移除盘符，处理剩余路径
        }

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            
            // 构建完整路径
            let fullPath;
            if (isWindowsPath) {
                // Windows 路径保持原有格式
                const pathParts = [parts[0], ...parts.slice(1, i + 1)];
                fullPath = pathParts.join('/');
            } else {
                // Unix 路径添加开头的斜杠
                fullPath = '/' + parts.slice(0, i + 1).join('/');
            }

            if (!current.children.has(part)) {
                const node = new TreeNode(fullPath);
                node.isFile = isFile;
                current.children.set(part, node);
            }

            current = current.children.get(part);
        }
    }
}

// 全局变量
let fileTree = null;
let tooltip = null;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const searchInput = document.getElementById('searchInput');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const fileList = document.getElementById('fileList');
    tooltip = document.getElementById('tooltip');

    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', () => fileInput.click());

    // 处理拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
        dropZone.style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        dropZone.style.backgroundColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        dropZone.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    searchInput.addEventListener('input', handleSearch);
    clearDataBtn.addEventListener('click', clearStoredData);

    // 初始化工具提示
    document.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.pageX + 10) + 'px';
        tooltip.style.top = (e.pageY + 10) + 'px';
    });

    // 加载保存的数据
    loadStoredData();
});

function handleFiles(files) {
    const fileList = document.getElementById('fileList');
    const treeContainer = document.getElementById('fileTree');
    fileList.innerHTML = '';
    
    // 显示加载状态
    treeContainer.innerHTML = `
        <div class="loading">
            <i class="mdi mdi-loading"></i>
            <p>正在处理文件...</p>
        </div>
    `;
    
    Array.from(files).forEach(file => {
        // 添加文件到显示列表
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <i class="mdi mdi-file-document"></i>
            <span>${file.name}</span>
        `;
        fileList.appendChild(fileItem);

        // 读取文件内容
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const paths = content.split('\n').filter(path => path.trim());
            
            // 初始化或更新文件树
            if (!fileTree) fileTree = new FileTree();
            paths.forEach(path => fileTree.addPath(path));
            
            // 保存所有数据到 localStorage
            saveStoredData();
            
            // 渲染树
            renderTree();
        };
        reader.readAsText(file);
    });
}

function saveStoredData() {
    if (!fileTree) return;
    
    // 收集所有路径
    const paths = [];
    function collectPaths(node) {
        if (node.isFile) {
            paths.push(node.path);
        }
        node.children.forEach(child => collectPaths(child));
    }
    fileTree.root.children.forEach(child => collectPaths(child));
    
    // 保存到 localStorage
    localStorage.setItem(myFileTreeData, JSON.stringify(paths));
}

function loadStoredData() {
    const storedData = localStorage.getItem(myFileTreeData);
    if (storedData) {
        const paths = JSON.parse(storedData);
        fileTree = new FileTree();
        paths.forEach(path => fileTree.addPath(path));
        renderTree();
    }
}

function renderTree(searchTerm = '') {
    const treeContainer = document.getElementById('fileTree');
    treeContainer.innerHTML = '';
    
    // 如果没有数据，显示提示信息
    if (!fileTree) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="mdi mdi-folder-open-outline"></i>
            <p>还没有任何文件目录，请上传文件开始使用</p>
        `;
        treeContainer.appendChild(emptyState);
        return;
    }
    
    renderNode(fileTree.root, treeContainer, searchTerm);
}

function renderNode(node, container, searchTerm) {
    if (node === fileTree.root) {
        Array.from(node.children.values()).forEach(child => {
            renderNode(child, container, searchTerm);
        });
        return;
    }

    const div = document.createElement('div');
    div.className = 'tree-node';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = node.isFile ? 'file-icon' : 'folder-icon';
    nameSpan.textContent = node.name;

    // 检查是否匹配搜索条件
    const matchesSearch = searchTerm && 
        (node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         node.path.toLowerCase().includes(searchTerm.toLowerCase()));

    // 检查子节点是否包含匹配项
    let hasMatchingChild = false;
    if (!node.isFile && searchTerm) {
        const checkChildren = (nodeToCheck) => {
            if (nodeToCheck.isFile) {
                return nodeToCheck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       nodeToCheck.path.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return Array.from(nodeToCheck.children.values()).some(child => checkChildren(child));
        };
        hasMatchingChild = Array.from(node.children.values()).some(child => checkChildren(child));
    }

    if (searchTerm && !matchesSearch && !hasMatchingChild) {
        return;
    }

    if (matchesSearch) {
        nameSpan.classList.add('highlight');
    }

    div.appendChild(nameSpan);

    if (node.isFile) {
        // 文件节点的事件处理
        nameSpan.addEventListener('mouseover', () => {
            tooltip.textContent = node.path;
            tooltip.style.display = 'block';
        });

        nameSpan.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        nameSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            const isWindows = navigator.platform.includes('Win');
            const pathToCopy = isWindows ? 
                node.path.replace(/\//g, '\\') : 
                (node.path.startsWith('/') ? node.path : '/' + node.path);
            navigator.clipboard.writeText(pathToCopy)
                .then(() => alert('文件路径已复制到剪贴板！'));
        });
    } else {
        // 文件夹节点的处理
        nameSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            div.classList.toggle('expanded');
            if (childrenContainer) {
                childrenContainer.classList.toggle('hidden');
            }
        });

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'folder'; // 移除 hidden 类，默认展开
        div.classList.add('expanded'); // 添加 expanded 类，显示展开图标

        Array.from(node.children.values()).forEach(child => {
            renderNode(child, childrenContainer, searchTerm);
        });

        if (childrenContainer.children.length > 0) {
            div.appendChild(childrenContainer);
        }
    }

    if (div.children.length > 0) {
        container.appendChild(div);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    renderTree(searchTerm);
}

function clearStoredData() {
    if (confirm('确定要清除保存的数据吗？')) {
        localStorage.removeItem(myFileTreeData);
        fileTree = null;
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        renderTree(); // 这将显示空状态
    }
} 