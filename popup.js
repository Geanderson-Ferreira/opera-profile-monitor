document.addEventListener('DOMContentLoaded', async () => {

    const hotel_object = await chrome.storage.local.get('hotel') || false
    const username_object = await chrome.storage.local.get('username') || false
    const password_object = await chrome.storage.local.get('password') || false
    const token_object = await chrome.storage.local.get('access_token') || false
    const json_data_resvs_object = await chrome.storage.local.get('jsonDataReservations') || false

    const hotel = hotel_object.hotel
    const username = username_object.username
    const password = password_object.password
    const token = token_object.access_token
    const dataContent = json_data_resvs_object.jsonDataReservations

    hotelComponent = document.getElementById('hotel_id')
    hotelComponent.textContent += hotel
    console.log({hotel: hotel, user: username, pass: password, token: token, dataContent: dataContent})

    if (username && password){
        await fetchOhipAPI(username, password)
    }

    if (token && hotel){
        await fetchReservationAPI(token, hotel)        
    }

    if (dataContent){
        await fillTable(dataContent)
    }

    async function fetchOhipAPI(user,pass) {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("x-app-key", "5502014f-a4f1-4135-9d45-ae5fd594eba5");
        myHeaders.append("enterpriseId", "{{EnterpriseId}}");
        myHeaders.append("Authorization", "Basic QUNDT1JBVF9DbGllbnQ6eWJRWDV4by1iS1dKVFhYcHBVamZULWxS");

        const urlencoded = new URLSearchParams();
        urlencoded.append("username", user);
        urlencoded.append("password", pass);
        urlencoded.append("grant_type", "password");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow"
        };

        fetch("https://acc2-oc.hospitality-api.us-ashburn-1.ocs.oraclecloud.com/oauth/v1/tokens", requestOptions)
        .then((response) => response.json())
        .then((result) => {

            const tokenData = result
            
            // Calcula o timestamp de expiração
            const currentTime = Math.floor(Date.now() / 1000); // Tempo atual em segundos
            const expirationTime = currentTime + tokenData.expires_in; // Tempo de expiração
     
            // Armazena o token e o tempo de expiração no chrome.storage.local
            chrome.storage.local.set({
                access_token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expirationTime: expirationTime
            }, function() {
                console.log('Token e tempo de expiração armazenados.');
            });

            //Deleta credenciais armazenadas do usuario
            chrome.storage.local.remove(['username', 'password'], () => {
                console.log('Dados de usuario deletados.');
            })

        })
        .catch((error) => console.error(error));
    };

    async function fetchReservationAPI(token, hotel){
        //Chamada API de reservas
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
        };

        fetch(`https://opera-profiles.vercel.app/reservas/?hotel_id=${hotel}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {

            //Deleta Reservation Content
            chrome.storage.local.remove('jsonDataReservations', () => {
                console.log('Dados de usuario deletados.');
            })

            //Coloca novos dados
            chrome.storage.local.set({
                jsonDataReservations: result
            }, function() {
                console.log('json de reservas inserido na localStorage.');
            });

        })
        .catch((error) => console.error(error));
    }

    async function fillTable(json){
        //Cria a table
        const tableBody = document.querySelector('#reservaTable tbody');
        tableBody.innerHTML = ''; // Limpa o corpo da tabela antes de adicionar novas linhas

        json.data.forEach(item => {
            const confirmation = item.reserva.reservationIdList.find(id => id.type === 'Confirmation');
            if (confirmation) {
                const row = document.createElement('tr');
                const cellConfirmation = document.createElement('td');
                cellConfirmation.textContent = confirmation.id;
                const cellRegra = document.createElement('td');
                cellRegra.textContent = item.regra;
                row.appendChild(cellConfirmation);
                row.appendChild(cellRegra);
                tableBody.appendChild(row);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('click', (event) => {
          const popup = document.getElementById('popup'); // Ou qualquer seletor para o conteúdo do popup
          if (!popup.contains(event.target)) {
            // Fecha o popup
            window.close(); // Fecha o popup da extensão
          }
        });
      });

});
