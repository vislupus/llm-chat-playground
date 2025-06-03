import './index.css';

const sidebarContainer = document.getElementById('sidebar-container');
const mainContentContainer = document.getElementById('main-content-container');
const appHeaderContainer = document.getElementById('app-header-container');
const appFooterContainer = document.getElementById('app-footer-container');

async function loadMenu() {
    try {
        const menuHtml = await window.electronAPI.renderTemplate('partials/menu.ejs');
        sidebarContainer.innerHTML = menuHtml;
        addMenuListeners();
        const initialPageLink = sidebarContainer.querySelector('a[data-page="home"]');
        if (initialPageLink) {
            initialPageLink.classList.add('active');
        }
    } catch (error) {
        console.error('Failed to load menu:', error);
        sidebarContainer.innerHTML = '<p>Failed to load menu.</p>';
    }
}

async function loadPageContent(pageName) {
    try {
        const pageTitles = {
            home: 'Home',
            create_bot: 'Create Chatbot',
            saved_memories: 'Saved Memories',
            chats: 'Chats',
            models: 'Models',
            settings: 'Settings',
        };

        const currentPageTitle = pageTitles[pageName] || 'Page';
        document.title = currentPageTitle;
        await loadHeader(currentPageTitle);

        const pageHtml = await window.electronAPI.renderTemplate(`pages/${pageName}.ejs`);
        mainContentContainer.innerHTML = pageHtml;

        setActiveMenuItem(pageName);

    } catch (error) {
        console.error(`Failed to load page ${pageName}:`, error);
        mainContentContainer.innerHTML = '<h1>Failed to load page.</h1>';
    }
}

window.loadPageContent = loadPageContent;

function setActiveMenuItem(pageName) {
    const allLinks = document.querySelectorAll('#sidebar-container nav ul li a');
    allLinks.forEach(link => {
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

async function loadHeader(pageTitle = 'Page') {
    try {
        const headerHtml = await window.electronAPI.renderTemplate('partials/header.ejs', {
            appName: 'TTTTTT',
            pageTitle: pageTitle
        });
        appHeaderContainer.innerHTML = headerHtml;
    } catch (error) {
        console.error('Failed to load header:', error);
        appHeaderContainer.innerHTML = '<p>Failed to load header.</p>';
    }
}

async function loadFooter() {
    try {
        const footerHtml = await window.electronAPI.renderTemplate('partials/footer.ejs', {
            companyName: 'Технологични Решения ЕООД'
        });
        appFooterContainer.innerHTML = footerHtml;
    } catch (error) {
        console.error('Failed to load footer:', error);
        appFooterContainer.innerHTML = '<p>Failed to load footer.</p>';
    }
}

function addMenuListeners() {
    sidebarContainer.addEventListener('click', (event) => {
        const targetAnchor = event.target.closest('a[data-page]');
        if (targetAnchor) {
            event.preventDefault();
            const pageName = targetAnchor.dataset.page;

            document.querySelectorAll('#sidebar-container nav ul li a').forEach(link => link.classList.remove('active'));
            targetAnchor.classList.add('active');

            loadPageContent(pageName);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadMenu();
    await loadPageContent('home');
    // await loadFooter();

    
    if (window.electronAPI && typeof window.electronAPI.onMenuDemoAction === 'function') {
        window.electronAPI.onMenuDemoAction((message) => {

            console.log(`[Renderer Process Console] Received from menu: ${message}`);

            alert(`Message from menu:\n\n${message}`);
        });
    } else {
        console.warn('window.electronAPI.onMenuDemoAction is not defined. Preload the script to load correctly?');
    }
});
