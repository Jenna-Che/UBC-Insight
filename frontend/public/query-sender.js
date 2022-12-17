
/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST","http://localhost:4321/query");
        xhr.onload = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.response);
                resolve(response);
            } else if (xhr.status === 400) {
                let error = xhr.response;
                reject(error);
            }
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(query));
        //xhr.send(JSON.parse(query.toString()).query);
    }).catch(function (error) {
        console.log(error);
    });
};
