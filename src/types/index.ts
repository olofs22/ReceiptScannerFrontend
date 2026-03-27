export interface Item{
    id: number;
    title: string;
    price: number;
    quantity: number;
}

export interface Receipt {
    id: number;
    storeName: string;
    date: string; 
    items: Item[];
}

export interface CreateItemDTO {
    title: string;
    price: number;
    quantity: number;
}

export interface CreateReceiptDTO {
    storeName: string;
    date: string; 
    items: CreateItemDTO[];
}