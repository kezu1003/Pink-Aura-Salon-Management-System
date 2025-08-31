export function getAllProducts (req,res){
    res.status(200).send("Fetched the products");
}

export function createProducts (req,res){
    res.status(201).json({message: "Products created successfully"});
}

export function updateProducts (req,res){
    res.status(200).json({message: "Products updated successfully"});
}

export function deleteProducts (req,res){
    res.status(200).json({message: "Products deleted successfully"});
}