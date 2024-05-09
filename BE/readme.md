db


Products {
    id: string,
    name: string,
    description: string,
    richDescription: string,
    image: string,
    images: string[],
    brand: string,
    price: number,
    category: Category,
    countInStock: number,
    rating: number,
    isFeatured: boolean,
    dateCreated: Date
}

Orders {
    id: string,
    orderItems: OrderItem[],
    shippingAddress1: string,
    shippingAddress2: string,
    city: string,
    zip: string,
    country: string,
    phone: number,
    status: string,
    totalPrice: number,
    user: User,
    dateCreated: Date
}

Category {
    id: string,
    name: string,
    icon: string,
    color: string,
    image: string
}
OrderItem {
    id: string,
    product: Product,
    quantity: number
}

User {
    id: string,
    name: string,
    email: string,
    passwordHash: string,
    street: string,
    city: string,
    zip: string,
    country: string,
    phone: number,
    isAdmin: boolean
}

