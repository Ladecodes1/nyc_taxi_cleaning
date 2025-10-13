class CustomSorter {
    constructor() {
        this.algorithms = {
            'bubble': this.bubbleSort,
            'selection': this.selectionSort,
            'insertion': this.insertionSort,
            'quick': this.quickSort,
            'merge': this.mergeSort
        };
    }

    sortData(data, sortBy = 'pickup_datetime', sortOrder = 'desc', algo = 'quick') {
        if (!data || data.length === 0) return [];

        console.log(`🔄 Sorting ${data.length} records by ${sortBy} (${sortOrder})`);

        const sortFn = this.algorithms[algo] || this.quickSort;
        const sorted = sortFn.call(this, [...data], sortBy, sortOrder);

        console.log(`✅ Done`);
        return sorted;
    }

    quickSort(arr, sortBy, order) {
        if (arr.length <= 1) return arr;

        const pivot = arr[Math.floor(arr.length / 2)];
        const left = [];
        const right = [];
        const equal = [];

        for (let i = 0; i < arr.length; i++) {
            const cmp = this.compare(arr[i][sortBy], pivot[sortBy], order);
            if (cmp < 0) {
                left.push(arr[i]);
            } else if (cmp > 0) {
                right.push(arr[i]);
            } else {
                equal.push(arr[i]);
            }
        }

        return [
            ...this.quickSort(left, sortBy, order),
            ...equal,
            ...this.quickSort(right, sortBy, order)
        ];
    }

    mergeSort(arr, sortBy, order) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid), sortBy, order);
        const right = this.mergeSort(arr.slice(mid), sortBy, order);

        return this.merge(left, right, sortBy, order);
    }

    merge(left, right, sortBy, order) {
        const result = [];
        let l = 0;
        let r = 0;

        while (l < left.length && r < right.length) {
            const cmp = this.compare(left[l][sortBy], right[r][sortBy], order);
            
            if (cmp <= 0) {
                result.push(left[l]);
                l++;
            } else {
                result.push(right[r]);
                r++;
            }
        }

        return result.concat(left.slice(l)).concat(right.slice(r));
    }

    bubbleSort(arr, sortBy, order) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.compare(arr[j][sortBy], arr[j + 1][sortBy], order) > 0) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
        return arr;
    }

    selectionSort(arr, sortBy, order) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (this.compare(arr[j][sortBy], arr[minIdx][sortBy], order) < 0) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            }
        }
        return arr;
    }

    insertionSort(arr, sortBy, order) {
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;
            
            while (j >= 0 && this.compare(arr[j][sortBy], key[sortBy], order) > 0) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    compare(a, b, order) {
        // Handle nulls
        if (a === null || a === undefined) return 1;
        if (b === null || b === undefined) return -1;
        if (a === null && b === null) return 0;

        // Handle different types
        if (typeof a === 'string' && typeof b === 'string') {
            // Date strings
            if (this.isDate(a) && this.isDate(b)) {
                const dateA = new Date(a);
                const dateB = new Date(b);
                const res = dateA.getTime() - dateB.getTime();
                return order === 'desc' ? -res : res;
            }
            // Regular strings
            const res = a.localeCompare(b);
            return order === 'desc' ? -res : res;
        }

        if (typeof a === 'number' && typeof b === 'number') {
            const res = a - b;
            return order === 'desc' ? -res : res;
        }

        // Try converting to numbers
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            const res = numA - numB;
            return order === 'desc' ? -res : res;
        }

        // Fallback to string compare
        const res = String(a).localeCompare(String(b));
        return order === 'desc' ? -res : res;
    }

    isDate(str) {
        return !isNaN(Date.parse(str));
    }

    filterData(data, filters) {
        if (!data || data.length === 0) return [];

        console.log(`🔍 Filtering ${data.length} records`);

        let filtered = [...data];

        Object.keys(filters).forEach(key => {
            const val = filters[key];
            if (val !== undefined && val !== null && val !== '') {
                filtered = this.applyFilter(filtered, key, val);
            }
        });

        console.log(`✅ Filtered to ${filtered.length} records`);
        return filtered;
    }

    applyFilter(data, field, val) {
        return data.filter(rec => {
            const recVal = rec[field];
            
            if (recVal === null || recVal === undefined) return false;

            // Range filter
            if (typeof val === 'object' && val.min !== undefined && val.max !== undefined) {
                return recVal >= val.min && recVal <= val.max;
            }

            // Date range filter
            if (typeof val === 'object' && val.start !== undefined && val.end !== undefined) {
                const recDate = new Date(recVal);
                const startDate = new Date(val.start);
                const endDate = new Date(val.end);
                return recDate >= startDate && recDate <= endDate;
            }

            // Multiple values (comma-separated)
            if (typeof val === 'string' && val.includes(',')) {
                const vals = val.split(',').map(v => v.trim());
                return vals.includes(String(recVal));
            }

            // Exact match
            return String(recVal) === String(val);
        });
    }

    getPerformance(data, sortBy, order) {
        const algos = Object.keys(this.algorithms);
        const results = {};

        algos.forEach(algo => {
            const start = performance.now();
            const sorted = this.algorithms[algo].call(this, [...data], sortBy, order);
            const end = performance.now();
            
            results[algo] = {
                time: (end - start).toFixed(4),
                sorted: sorted.length === data.length
            };
        });

        return results;
    }

    multiSort(data, criteria) {
        if (!data || data.length === 0) return [];

        console.log(`🔄 Multi-sort on ${data.length} records`);

        return [...data].sort((a, b) => {
            for (const c of criteria) {
                const { field, order = 'asc' } = c;
                const cmp = this.compare(a[field], b[field], order);
                if (cmp !== 0) return cmp;
            }
            return 0;
        });
    }
}

module.exports = new CustomSorter();