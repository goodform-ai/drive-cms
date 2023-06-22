# Google Cloud Platform Setup

To use Google Drive as a CMS, first you'll have to do some setup in Google Cloud Platform.

1. Go to [Google Cloud Platform Console](https://console.cloud.google.com/) and log in or create an account.
2. Go to [APIs & Services > API Library](https://console.cloud.google.com/apis/library), find the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) and enable it.
3. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials) and click "Create Credentials", then "Service Account".
    - Give it any name you like.
    - The Service account ID will create an email, such as `abcde@project.iam.gserviceaccount.com`. **Keep this email**.
    - The service account does not need any special permissions.
    - You do not need to add any users.
    - Once you have created your Service Account, go back to [API & Services > Credentials](https://console.cloud.google.com/apis/credentials). Under Service Accounts, click the email for the account you just created.
4. In the details page for your Service Account, click the "Keys" tab, then click the "Add Key" button, then "Create new key". Select "JSON" and click create.
    - The file will be downloaded to your computer.
    - Save this file in a safe and **secret** place.
    - It's very important this file not be exposed.
5. Rename the file "credentials.json" and move it to your server.

Okay, that's all the hard part done! Now you just have to give the Service Account access to the files you want your website to have access to.

1. Go to [Google Drive](https://drive.google.com).
2. Click the files/folders you want your site to display.
3. Click sharing, and add the email address for your Service Account.

And you're all done!
