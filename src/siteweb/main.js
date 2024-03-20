function showPage(pageId) {
    // Cacher toutes les pages
    const pages = document.querySelectorAll('div[id]');
    pages.forEach(page => {
        page.style.display = 'none';
    });

    // Afficher la page spécifiée
    const selectedPage = document.getElementById(pageId);
    selectedPage.style.display = 'block';
}
