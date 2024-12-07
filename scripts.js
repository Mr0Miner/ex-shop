let filePath = "shop list.xlsx";

document.addEventListener('DOMContentLoaded', function () {
    // تنظیم حالت پیشفرض به روز
    document.body.classList.add('day');
    document.querySelector('.container').classList.add('day');

    // اضافه کردن دکمه تغییر حالت
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';

    const dayIcon = '<img src="img/dayandnight.svg" alt="">';
    const nightIcon = '<img src="img/dayandnight.svg" alt="">';

    toggleButton.innerHTML = dayIcon; // شروع با آیکون روز
    toggleButton.onclick = function() {
        const isDay = document.body.classList.toggle('day');
        document.body.classList.toggle('night');
        document.querySelector('.container').classList.toggle('day');
        document.querySelector('.container').classList.toggle('night');

        // تغییر حالت برای سایر کلاس‌ها
        document.querySelectorAll('.tablink, .info-table td, .search-container select, .search-container input').forEach(element => {
            element.classList.toggle('day');
            element.classList.toggle('night');
        });

        toggleButton.innerHTML = isDay ? nightIcon : dayIcon;
    };
    document.querySelector('.container').appendChild(toggleButton);

    // بررسی و خواندن مسیر فایل
    if (filePath) {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.arrayBuffer();
            })
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                let totals = { profit: 0, products: 0, mult: 0, diff: 0 };
                const rows = [];

                const sheet = workbook.Sheets[workbook.SheetNames[0]]; // فقط شیت اول
                console.log(sheet['E363'], sheet['F363'], sheet['G363'], sheet['H363']);
                
                totals.profit += sheet['E363'] ? sheet['E363'].v : 0;
                totals.products += sheet['F363'] ? sheet['F363'].v : 0;
                totals.mult += sheet['G363'] ? sheet['G363'].v : 0;
                totals.diff += sheet['H363'] ? sheet['H363'].v : 0;

                const range = XLSX.utils.decode_range(sheet['!ref']);
                for (let R = range.s.r; R <= Math.min(range.e.r, 361); ++R) { // محدودیت به ردیف 361
                    const row = [];
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cell_address = { c: C, r: R };
                        const cell_ref = XLSX.utils.encode_cell(cell_address);
                        const cell = sheet[cell_ref];
                        row.push(cell ? cell.v : "");
                    }
                    rows.push(row);
                }

                displayTable(rows);
                updateTotals(totals);
            })
            .catch(error => console.error(error));
    }

    // دکمه برای بالا آمدن
    const scrollToTopButton = document.getElementById('scrollToTop');

    // نمایش یا پنهان کردن دکمه بر اساس اسکرول
    window.onscroll = function() {
        scrollToTopButton.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
    };

    // عملکرد دکمه برای بالا آمدن
    scrollToTopButton.onclick = function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
});

function displayTable(rows) {
    const tbody = document.querySelector('#excel-table tbody');
    tbody.innerHTML = '';

    rows.slice(1).forEach((row, index) => {
        if (row[0]) {
            const tr = document.createElement('tr');
            const tdIndex = document.createElement('td');
            tdIndex.textContent = index + 1; // شماره ردیف
            tr.appendChild(tdIndex);

            if (row.length >= 10) {
                [row[0], row[1], row[3], row[2], row[4], row[5], row[9]].forEach((cell, index) => {
                    const td = document.createElement('td');
                    td.textContent = cell || "";
                    applyCellStyles(td, cell, index);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
        }
    });
}

function applyCellStyles(td, cell, index) {
    if (index === 5) {
        if (cell === 0 || cell === "") {
            td.classList.add('cell-out-of-stock');
            td.textContent = "ناموجود";
        } else if (cell === 1) {
            td.classList.add('cell-low-stock');
            td.textContent = "1";
        } else if (cell > 1) {
            td.classList.add('cell-stock');
            td.textContent = cell;
        }
    } else if ([3, 4, 6].includes(index)) {
        if (cell >= 50) {
            td.classList.add('cell-stock');
        } else {
            td.classList.add('cell-low-stock');
        }
    }
}

function updateTotals(totals) {
    document.getElementById('total-profit').textContent = totals.profit.toLocaleString();
    document.getElementById('total-products').textContent = totals.products.toLocaleString();
    document.getElementById('total-mult').textContent = totals.mult.toLocaleString();
    document.getElementById('total-diff').textContent = totals.diff.toLocaleString();

    document.getElementById('total-profit-words').textContent = numberToWords(totals.profit);
    document.getElementById('total-products-words').textContent = numberToWords(totals.products);
    document.getElementById('total-mult-words').textContent = numberToWords(totals.mult);
    document.getElementById('total-diff-words').textContent = numberToWords(totals.diff);
}

function searchTable() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const searchColumn = document.getElementById('search-column').value;
    const rows = document.querySelectorAll('#excel-table tbody tr');

    rows.forEach((row, index) => {
        const cell = row.cells[searchColumn];
        const text = cell ? cell.innerText.toLowerCase() : "";
        const rowIndex = (index + 1).toString();
        row.style.display = text.includes(searchInput) || rowIndex.includes(searchInput) ? '' : 'none';
    });
}

function numberToWords(num) {
    return num.toString().num2persian();
}