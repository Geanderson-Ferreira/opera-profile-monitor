function logLoginData() {

    const username = document.getElementById('username') || false;
    const password = document.getElementById('password') || false;

    if (username && password) {
        // Armazena os dados no chrome.storage.local
        chrome.storage.local.set({
            username: username.value,
            password: password.value
        }, () => {
            console.log('Dados de login armazenados.');
        });
    }
}

trecho_hotel_id_seletor = ['oc_pg_pt:oc_pg_usrnf_1:oc_dc_pg_usrnf']

function addLoginButtonListener() {
    const loginBtn = document.getElementById('loginBtn');
    const HOTEL_ID = new String(querySelectorByIdIncludesText('span', trecho_hotel_id_seletor).innerText).substring(0,5)
    
    if (HOTEL_ID && HOTEL_ID != 'undef'){
        chrome.storage.local.set({
            hotel: HOTEL_ID
        }, () => {
            console.log(`Dados de hotel ${HOTEL_ID} armazenados.`);
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            logLoginData();
        });
    }
}

const observer = new MutationObserver(() => {
    addLoginButtonListener();
});

observer.observe(document.body, { childList: true, subtree: true });

addLoginButtonListener();


function getDefaultCpTerminal() {
    const value = localStorage.getItem('DEFAULT_CP_TERMINAL');
    if (value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return false; // Retorna false se ocorrer um erro ao fazer o parse
        }
    }
    return false; // Retorna false se não existir
}


//Funcao busca elemento por trecho de ID
function querySelectorByIdIncludesText (selector, possibleText, win = window){

    for (let text of possibleText){
        let resultado = Array.from(win.document.querySelectorAll(selector)).find(el => el.id.includes(text)) || false;
        if (resultado){
            return resultado;
        }
    }
    return false;
}