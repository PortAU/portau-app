// Define um nome e uma versão para o nosso cache
const CACHE_NAME = 'portau-sjpa-cache-v1';

// Lista de arquivos que formam o "casco" do nosso aplicativo (App Shell)
// Todos os arquivos HTML, CSS e JS essenciais devem estar aqui.
const URLS_TO_CACHE = [
    '/',
    'index.html',
    'home.html',
    'baias.html',
    'cadastrar-animal.html',
    'cadastrar-baia.html',
    'criar-conta.html',
    'esqueci-senha.html',
    'perfil.html',
    'suporte.html',
    'css/style.css',
    'js/menu.js',
    'manifest.json',
    'images/logo.png' // Adicione outros ícones/imagens importantes aqui
];

// Evento 'install': é disparado quando o Service Worker é instalado pela primeira vez.
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    // Espera até que o cache seja aberto e todos os nossos arquivos sejam armazenados
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aberto. Adicionando arquivos do App Shell.');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Evento 'fetch': é disparado toda vez que o app faz um pedido de rede (ex: carregar uma página, imagem, etc.)
self.addEventListener('fetch', (event) => {
    // Responde ao pedido com uma estratégia "cache-first"
    event.respondWith(
        // 1. Tenta encontrar o recurso no cache
        caches.match(event.request)
            .then((response) => {
                // Se encontrou no cache, retorna a resposta do cache
                if (response) {
                    console.log('Service Worker: Recurso encontrado no cache!', event.request.url);
                    return response;
                }
                // Se não encontrou, faz o pedido à rede
                console.log('Service Worker: Recurso não encontrado no cache, buscando na rede...', event.request.url);
                return fetch(event.request);
            })
    );
});

// Evento 'activate': é disparado quando o Service Worker é ativado.
// Útil para limpar caches antigos de versões anteriores do app.
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Ativado.');
    // Lógica para limpar caches antigos pode ser adicionada aqui no futuro.
});