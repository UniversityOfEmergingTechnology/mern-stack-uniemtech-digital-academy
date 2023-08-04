exports.passwordUpdated = (email, body) => {
  return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Update Confirmation</title>
    <style>
            body{
                background-color: white;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .heading{
                max-width: 200px;
                font-size: 24px;
                font-weight: bold;
                margin: 0 auto;
                text-align: center;
                margin-bottom: 50px;
            }
            .message{
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .body{
                font-size: 16px;
                margin-bottom: 20px;
            }
            .support{
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
            .highlight{
                font-weight: bold;
            }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="heading">Uniemtech Digital Academy</h1>
      <div class="message">Password Update Confirmation</div>
      <div class="body">
        <p>Hey ${body}</p>
        <p>
          Your password has been successfully updated for the email
          <span class="highlight">${email}</span>
        </p>
        <p>
          If you did not request this password change, please contact us
          immediately to secure your account
        </p>
      </div>
      <div class="support">
        If you have any questions or need assistance , please feel free to reach
        out to us at
        <a href="mailto:uniemtechdigitalacademy@gmail.com">
          uniemtechdigitalacademy@gmail.com</a
        >
        We are here to help
      </div>
    </div>
  </body>
</html>

    `;
};
