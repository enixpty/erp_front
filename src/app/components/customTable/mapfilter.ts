 interface PrimeNGFilter {
    value: any;
    matchMode: string;
    operator: string;
}

interface PrimeNGFilters {
    [key: string]: PrimeNGFilter[];
}

// Suponiendo que 'event.filters' es el objeto que mostraste
export function extractActiveFilters(filters: PrimeNGFilters): { [key: string]: any } {
    
    const activeFilters: { [key: string]: any } = {};

    // 1. Iterar sobre las claves del objeto (name, code, description, etc.)
    for (const fieldName in filters) {
        // Asegurarse de que la propiedad pertenece al objeto y tiene un array
        if (filters.hasOwnProperty(fieldName) && filters[fieldName].length > 0) {
            
            // 2. Acceder al primer objeto de filtro (en PrimeNG simple, siempre es el [0])
            const filterObject = filters[fieldName][0];
            
            // 3. 📌 Verificar si 'value' NO es null o undefined, Y no es una cadena vacía (opcional pero recomendado)
            if (filterObject.value !== null && filterObject.value !== undefined && filterObject.value !== '') {
                
                // 4. Construir el nuevo objeto solo con los filtros activos.
                //    Puedes enviar el objeto completo del filtro o solo el valor.
                
                // Opción A: Enviar solo el valor y el matchMode
                activeFilters[fieldName] = {
                    value: filterObject.value,
                    matchMode: filterObject.matchMode
                };
                
                // Opción B: Enviar el objeto completo (si tu backend lo necesita)
                // activeFilters[fieldName] = filterObject;
            }
        }
    }
    
    return activeFilters;
}