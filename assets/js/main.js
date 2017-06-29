// Hard coded for demo purpose;
var apiUser = "admin";
var apiPass = "nimda321!"
var table;

//Do not use server side pagination
const pageSize = 10000;

const apiServer = 'https://customers.view-this.info';
//const apiServer = 'http://localhost:8080';
const apiBase = apiServer + '/api';
const apiCustomers = apiBase + '/customers?size=' + pageSize;



$(document).ready(function() {
    table = $('#customer-table').DataTable({
        'processing': true,
        'ajax': {
            'url': apiCustomers,
            'dataSrc': '_embedded.customers',
        },
        'columns': [
            { 'data': 'email' },
            { 'data': 'firstName' },
            { 'data': 'lastName' }
        ],
        "columnDefs": [{
            "targets": [3],
            "data": null,
            "defaultContent": "<button class='btn btn-danger delete'>X</button>"
        }],
        'dom': 'Bfrtip',
        'buttons': [{
            className: 'btn btn-primary',
            text: 'New',
            action: function(e, dt, node, config) {
                showForm();
            }
        }, {
            className: 'btn btn-default',
            text: 'Refresh',
            action: function(e, dt, node, config) {
                dt.ajax.reload();
            }
        }],
        'paging': true,
    });

    $('#customer-table tbody').on('click', 'button.delete', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var data = table.row($(this).parents('tr')).data();
        if (confirm("Are you sure you want to delete customer?")) {
            deleteCustomer(data._links.self.href);
        }
    });

    $('#customer-table tbody').on('click', 'tr', function() {
        showForm(table.row(this).data());
    });

});

var basicAuth;

function getAuth() {
    if (!basicAuth)
        basicAuth = 'Basic ' + btoa(apiUser + ":" + apiPass);
    return basicAuth;
}

function saveCustomer() {

    event.preventDefault();
    var formUrl = $("#selfUrl").val() !== "" ? $("#selfUrl").val() : apiCustomers;
    var reqType = $("#selfUrl").val() !== "" ? "PUT" : "POST";

    $.ajax({
        type: reqType,
        url: formUrl,
        data: JSON.stringify(objectifyForm($("#customer-form").serializeArray())),
        contentType: "application/json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', getAuth());
        },
        success: function(res, status, jqXhr) {
            showAlert("Saved", (status == "success" ? "success " : "danger"));
            if (jqXhr.status == 201) {
                $("#selfUrl").val(res._links.self.href);
            }
            table.ajax.reload();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            showAlert("An error occured while saving the customer", "danger", "");
        }
    });
}

function deleteCustomer(customerUrl) {
    $.ajax({
        type: 'DELETE',
        url: customerUrl,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', getAuth());
        },
        success: function(res, status, jqXhr) {
            table.ajax.reload();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("An error occured while deleting the customer", "danger", "");
        }
    });
}

function showForm(data) {
    $(".modal-content").load("form.html", function() {
        if (data) {
            for (var field in data) {
                $("#" + field).val(data[field]);
            }

            $("#selfUrl").val(data._links.self.href);
        }

        $('#myModal').modal('show');
    });
}



function showAlert(msg, flashKind = "success", msgTitle = "", autoClose = true) {
    var myAlertMsg = "<div id='alertMsgDiv' class='alert alert-" + flashKind + "' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><strong>" + msgTitle + "</strong>&nbsp;&nbsp;" + msg + "</div>";
    $("#alertMsg").html(myAlertMsg);

    if (autoClose) {
        window.setTimeout(function() {
            $("#alertMsgDiv").fadeTo(500, 0).slideUp(500, function() {
                $(this).remove();
            });
        }, 4000);
    }
}

function objectifyForm(formArray) {
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}