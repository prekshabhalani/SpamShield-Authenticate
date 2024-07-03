class Common {

  /********************************************************
   @Purpose Handle Success Response
   @Parameter
   {
      res, status, statusCode, message, data,meta, page, perPage, total,readOnlyData
   }
   @Return JSON String
   ********************************************************/
  handleResolve(resolveParams) {
    const { res, status, statusCode, message, data, meta, page, perPage, total, readOnlyData } =
      resolveParams;
    return res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
      readOnlyData,
      page,
      perPage,
      total,
      extraMeta: meta
    });
  }

  /********************************************************
   @Purpose Handle Error Response
   @Parameter
   {
      res, status, statusCode, message
   }
   @Return JSON String
   ********************************************************/
  handleReject(res, status, statusCode, message, readOnlyData, errorMessage, errorKey) {
    let data = {
      status,
      statusCode,
      message,
    };
    if (readOnlyData) {
      data.readOnlyData = readOnlyData;
    }
    if (errorMessage) {
      data.errorMessage = errorMessage;
    }
    if (errorKey) {
      data.errorKey = errorKey;
    }
    return res.status(statusCode).send(data);
  }

}

module.exports = new Common();
