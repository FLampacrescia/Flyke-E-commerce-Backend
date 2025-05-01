function getCategories(req, res) {
    res.send("get categories");
}
function createCategory(req, res) {
    res.send("create category");
}

module.exports = {
    getCategories,
    createCategory
}