export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 

export const API_ENDPOINTS = {
    //AUTH 
    LOGIN: `${API_BASE_URL}/accounts/login/`,
    //DASHBOARD
    dashboard :{
        base : `${API_BASE_URL}/managers/dashboard/`,
        detailedStats : `${API_BASE_URL}/managers/dashboard/detailed-stats/`,
        recentOrders : `${API_BASE_URL}/managers/dashboard/recent-orders/`,
        topProducts : `${API_BASE_URL}/managers/dashboard/top-products/`,
    },
    //PARTNERS
    parteners :{
        base : `${API_BASE_URL}/partenaire/`,
        detail : (id: string) => `${API_BASE_URL}/partenaire/${id}/`,
        update : (id: string) => `${API_BASE_URL}/partenaire/${id}/`,
        delete : (id: string) => `${API_BASE_URL}/partenaire/${id}/`,
        
        partnerProducts : (id: string) => `${API_BASE_URL}/partenaire/products/${id}/`,
        allProducts : `${API_BASE_URL}/partenaire/products/`,
        //partenaire off
        of : `${API_BASE_URL}/partenaire/of/`,


    },
    //PRODUCTS
    products :{
        base : `${API_BASE_URL}/products/`,
        detail : (id: string) => `${API_BASE_URL}/products/viewset/${id}/`,
        add : `${API_BASE_URL}/products/viewset/`,
        addVariantes : (id: string) => `${API_BASE_URL}/products/viewset/${id}/add_variantes_bulk/`,
        addImages : (id: string) => `${API_BASE_URL}/products/viewset/${id}/add-images-main-product/`,
        deleteImages :  `${API_BASE_URL}/products/viewset/remove-image-variante/`,

    },
    //ORDERS
    orders :{
        base : `${API_BASE_URL}/orders/admin/`,
        detail : (id: string) => `${API_BASE_URL}/orders/admin/${id}/`,
        show : (id: string) => `${API_BASE_URL}/orders/show/admin/?number=${id}`,
        accept : (id: string) => `${API_BASE_URL}/orders/accept/admin/?number=${id}/`,
        export : `${API_BASE_URL}/orders/export/orders/`,

    },
    //CATEGORIES
    categories :{
        base : `${API_BASE_URL}/categories/`,
        detail : (id: string) => `${API_BASE_URL}/categories/viewset/${id}/`,
        delete : (id: string) => `${API_BASE_URL}/categories/viewset/${id}/`,
        update : (id: string) => `${API_BASE_URL}/categories/viewset/${id}/`,
        parent : `${API_BASE_URL}/categories/viewset/parent/category/`,
        add : `${API_BASE_URL}/categories/viewset/`,
        //categories off
        of : `${API_BASE_URL}/categories/viewset/of/`,
    },
    //REVIEWS
    reviews :{
        base : `${API_BASE_URL}/reviews/admin/`,
    },
    //USERS
    users :{
        base : `${API_BASE_URL}/accounts/admin/`,
        detail : (id: string) => `${API_BASE_URL}/accounts/admin/${id}/`,
        delete : (id: string) => `${API_BASE_URL}/accounts/admin/${id}/`,
        update : (id: string) => `${API_BASE_URL}/accounts/admin/${id}/`,
        add : `${API_BASE_URL}/users/`,
    },
    //PROMOCODES
    promocodes :{
        base : `${API_BASE_URL}/promocode/`,
        detail : (id: string) => `${API_BASE_URL}/promocode/${id}/`,
        delete : (id: string) => `${API_BASE_URL}/promocode/${id}/`,
        update : (id: string) => `${API_BASE_URL}/promocode/${id}/`,
        add : `${API_BASE_URL}/promocode/`,
    },
    //ATTRIBUTES
    attributes :{
        base : `${API_BASE_URL}/products/attributes/of/`,
        detail : (id: string) => `${API_BASE_URL}/products/attributes/of/${id}/`,
        delete : (id: string) => `${API_BASE_URL}/products/attributes/of/${id}/`,
        update : (id: string) => `${API_BASE_URL}/products/attributes/of/${id}/`,
        add : `${API_BASE_URL}/products/attributes/of/`,
    },

    // TAGS
    tags :{
        base : `${API_BASE_URL}/tags/`,
        detail : (id: string) => `${API_BASE_URL}/tags/${id}/`,
        delete : (id: string) => `${API_BASE_URL}/tags/${id}/`,
        update : (id: string) => `${API_BASE_URL}/tags/${id}/`,
        add : `${API_BASE_URL}/tags/`,
        //tags off
        of : `${API_BASE_URL}/tags/viewset/of/`,
    },
  
}