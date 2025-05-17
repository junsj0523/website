// HTML에서 테마 토글 버튼 요소를 가져옵니다.
const themeToggleButton = document.getElementById('theme-toggle');
// 문서의 body 요소를 가져옵니다. 테마 클래스를 적용할 대상입니다.
const bodyElement = document.body;
// 사용자의 시스템이 다크 모드를 선호하는지 확인하는 미디어 쿼리 객체를 생성합니다.
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

/**
 * 지정된 테마를 웹 페이지에 적용하고, 사용자의 선택을 localStorage에 저장합니다.
 * @param {string} theme - 적용할 테마 ('dark' 또는 'light').
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        // body 요소에 'dark-mode' 클래스를 추가하고 'light-mode' 클래스를 제거합니다.
        bodyElement.classList.add('dark-mode');
        bodyElement.classList.remove('light-mode'); // 명시적으로 라이트 모드 클래스 제거
        // 토글 버튼의 아이콘/텍스트를 라이트 모드 전환용(해 아이콘)으로 변경합니다.
        themeToggleButton.textContent = '☀️';
        themeToggleButton.setAttribute('aria-label', '라이트 테마로 전환');
    } else {
        // body 요소에 'light-mode' 클래스를 추가하고 'dark-mode' 클래스를 제거합니다.
        bodyElement.classList.add('light-mode');
        bodyElement.classList.remove('dark-mode');
        // 토글 버튼의 아이콘/텍스트를 다크 모드 전환용(달 아이콘)으로 변경합니다.
        themeToggleButton.textContent = '🌙';
        themeToggleButton.setAttribute('aria-label', '다크 테마로 전환');
    }
    // 사용자가 선택한 테마를 localStorage에 'theme' 키로 저장합니다.
    localStorage.setItem('theme', theme);
}

/**
 * 테마 토글 버튼 클릭 시 현재 테마를 확인하고 반대 테마로 전환하는 함수입니다.
 */
function toggleTheme() {
    // 현재 localStorage에 저장된 테마 값을 가져옵니다.
    const currentTheme = localStorage.getItem('theme');
    // 현재 테마가 'dark'이면 'light'로, 그렇지 않으면 'dark'로 설정합니다.
    if (currentTheme === 'dark') {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }
}

/**
 * 페이지 로드 시 실행되어 사용자의 저장된 테마나 시스템 설정을 기반으로 초기 테마를 설정합니다.
 */
function initializeTheme() {
    // localStorage에서 이전에 저장된 테마 설정을 불러옵니다.
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        // 저장된 테마가 있으면 해당 테마를 적용합니다.
        applyTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        // 저장된 테마가 없고, 시스템 설정이 다크 모드를 선호하면 다크 테마를 적용합니다.
        applyTheme('dark');
    } else {
        // 저장된 테마도 없고 시스템 설정도 다크 모드가 아니면 기본값으로 라이트 테마를 적용합니다.
        applyTheme('light');
    }
}

// 테마 토글 버튼에 클릭 이벤트 리스너를 추가합니다. 버튼 클릭 시 toggleTheme 함수가 실행됩니다.
themeToggleButton.addEventListener('click', toggleTheme);

// 사용자의 시스템 테마 설정 변경을 감지하는 이벤트 리스너를 추가합니다.
prefersDarkScheme.addEventListener('change', (event) => {
    // 사용자가 명시적으로 테마를 선택하여 localStorage에 저장한 경우가 아니라면,
    // 시스템 테마 변경에 따라 웹사이트 테마도 자동으로 업데이트합니다.
    if (!localStorage.getItem('theme')) {
        if (event.matches) {
            // 시스템이 다크 모드로 변경되면 웹사이트도 다크 테마로 설정합니다.
            applyTheme('dark');
        } else {
            // 시스템이 라이트 모드로 변경되면 웹사이트도 라이트 테마로 설정합니다.
            applyTheme('light');
        }
    }
});

// 페이지가 처음 로드될 때 초기 테마 설정을 실행합니다.
initializeTheme();
