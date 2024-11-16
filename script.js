const createForm = document.querySelector('.transaction-form');
const transactionList = document.getElementById('transaction-list');
const transactionResult = document.querySelector('.transaction-result');


async function fetchAllTransactions() {
    try {
        const response = await fetch('https://acb-api.algoritmika.org/api/transaction');
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        const transactions = await response.json();
        transactions.forEach(transaction => {
            addTransactionToList(transaction); 
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        transactionResult.textContent = 'Error fetching transactions.';
    }
}


createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const from = document.querySelector('.from-input').value;
    const to = document.querySelector('.to-input').value;
    const amount = document.querySelector('.amount-input').value;

    const newTransaction = { from, to, amount };

    
    const response = await fetch('https://acb-api.algoritmika.org/api/transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
    });

    if (response.ok) {
        const data = await response.json();
        addTransactionToList(data); 
        transactionResult.textContent = 'Transaction added successfully!';
        createForm.reset();
    } else {
        transactionResult.textContent = 'Failed to add transaction!';
    }
});


function addTransactionToList(transaction) {
    const li = document.createElement('li');
    li.dataset.id = transaction.id;
    li.innerHTML = `
        ${transaction.from} → ${transaction.to}: $${transaction.amount}
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
        <button onclick="deleteTransaction(${transaction.id})">Delete</button>
    `;
    transactionList.appendChild(li);
}


function editTransaction(id) {
    const li = document.querySelector(`li[data-id='${id}']`);
    const from = prompt('Edit From:', li.querySelector('span').textContent);
    const to = prompt('Edit To:', li.querySelector('span').textContent);
    const amount = prompt('Edit Amount:', li.querySelector('span').textContent);

    if (from && to && amount) {
        const updatedData = { from, to, amount };

        
        fetch(`https://acb-api.algoritmika.org/api/transaction/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => response.json())
        .then(data => {
            li.innerHTML = `
                ${data.from} → ${data.to}: $${data.amount}
                <button class="edit-btn" onclick="editTransaction(${data.id})">Edit</button>
                <button onclick="deleteTransaction(${data.id})">Delete</button>
            `;
            transactionResult.textContent = 'Transaction updated successfully!';
        })
        .catch(error => {
            console.error(error);
            transactionResult.textContent = 'Failed to update transaction!';
        });
    }
}


function deleteTransaction(id) {
    const li = document.querySelector(`li[data-id='${id}']`);

   
    fetch(`https://acb-api.algoritmika.org/api/transaction/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            li.remove();
            transactionResult.textContent = 'Transaction deleted successfully!';
        } else {
            transactionResult.textContent = 'Failed to delete transaction!';
        }
    })
    .catch(error => {
        console.error(error);
        transactionResult.textContent = 'Failed to delete transaction!';
    });
}


window.onload = function() {
    fetchAllTransactions(); 
}
