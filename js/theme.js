const bodyElement = document.body;
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
    if (theme === 'dark') {
        bodyElement.classList.add('dark-mode');
        bodyElement.classList.remove('light-mode');
    } else {
        bodyElement.classList.add('light-mode');
        bodyElement.classList.remove('dark-mode');
    }
}

function initializeTheme() {
    if (prefersDarkScheme.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

prefersDarkScheme.addEventListener('change', (event) => {
    if (event.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
});

initializeTheme();
