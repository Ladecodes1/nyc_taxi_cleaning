// Function for sorting data
const sortData = (data, sortBy = 'pickup_datetime', order = 'desc') => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => {
        return compare(a[sortBy], b[sortBy], order);
    });

    console.log('Done sorting');
    return sorted;
};

// Compare two values
const compare = (a, b, order) => {
    if (a == null) return 1;
    if (b == null) return -1;

    let result = 0;

    // Checking if both are dates
    if (isDate(a) && isDate(b)) {
        const dateA = new Date(a);
        const dateB = new Date(b);
        result = dateA.getTime() - dateB.getTime();
    }
    
    // Checking if both are numbers / strings
    else if (typeof a === 'number' && typeof b === 'number') {
        result = a - b;
    }
    else if (typeof a === 'string' && typeof b === 'string') {
        result = a.localeCompare(b);
    }
    else {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            result = numA - numB;
        } else {
            result = String(a).localeCompare(String(b));
        }
    }

    // Reverse if descending
    return order === 'desc' ? -result : result;
};

const isDate = (str) => {
    return !isNaN(Date.parse(str));
};

// Filter data
const filterData = (data, filters) => {
    if (!data || data.length === 0) return [];

    console.log(`Filtering ${data.length} records...`);

    let result = [...data];

    for (const key in filters) {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '') {
            result = applyFilter(result, key, val);
        }
    }

    console.log(`Got ${result.length} records`);
    return result;
};

// Apply single filter
const applyFilter = (data, field, val) => {
    return data.filter(item => {
        const itemVal = item[field];
        
        if (itemVal == null) return false;

        // Range filter (e.g. {min: 10, max: 50})
        if (typeof val === 'object' && val.min !== undefined && val.max !== undefined) {
            return itemVal >= val.min && itemVal <= val.max;
        }

        // Date range filter
        if (typeof val === 'object' && val.start !== undefined && val.end !== undefined) {
            const itemDate = new Date(itemVal);
            const startDate = new Date(val.start);
            const endDate = new Date(val.end);
            return itemDate >= startDate && itemDate <= endDate;
        }

        // Multiple values (comma-separated like "1,2,3")
        if (typeof val === 'string' && val.includes(',')) {
            const values = val.split(',').map(v => v.trim());
            return values.includes(String(itemVal));
        }

        // Exact match
        return String(itemVal) === String(val);
    });
};

module.exports = {
    sortData,
    filterData
};