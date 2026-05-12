export interface Attribute {
    id?: number | string;
    name: string;
    status: string;
    created?: string;
    modified?: string;
}

export interface AttributeResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Attribute[];
}

export interface AttributeValue {
    id?: number | string;
    attribute: number | string;
    attribute_name?: string;
    value: string;
    status: string;
    created?: string;
    modified?: string;
}

export interface AttributeValueResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AttributeValue[];
}
