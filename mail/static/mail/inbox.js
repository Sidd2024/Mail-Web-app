document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function send_email(event){

  event.preventDefault()

  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  
  .then(response => load_mailbox('sent'));
}

function view_email(email_id,mailbox){

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#view-email').style.display = 'block';
      
      console.log(email);
      if(mailbox === 'sent'){

        document.querySelector('#view-email').innerHTML = 
      `<h4>From: </h4><span>${email['sender']}</span><br>
      <h4>To: </h4><span>${email['recipients']}</span><br>
      <h4>Subject: </h4><span>${email['subject']}</span><br>
      <h4>Timestamp: </h4><span>${email['timestamp']}</span><br><br>
      <button id="reply" class="btn">Reply</button>
      <br><hr><p>${email['body']}</p>`;

      }
      else{

      archive = !email['archived'] ? 'Archive' : 'Unarchive';

      document.querySelector('#view-email').innerHTML = 
      `<h4>From: </h4><span>${email['sender']}</span><br>
      <h4>To: </h4><span>${email['recipients']}</span><br>
      <h4>Subject: </h4><span>${email['subject']}</span><br>
      <h4>Timestamp: </h4><span>${email['timestamp']}</span><br><br>
      <button id="reply" class="btn">Reply</button>
      <button id="archive" class="btn">${archive}</button>
      <br><hr><p>${email['body']}</p>`;

      document.querySelector('#archive').addEventListener('click', function() {
        fetch('/emails/' + email['id'], {
          method: 'PUT',
          body: JSON.stringify({ archived : !email['archived'] })
        })
        .then(response => load_mailbox('inbox'))
      });
    }
    document.querySelector('#reply').addEventListener('click', ()=>{
      compose_email();

      document.querySelector('#compose-recipients').value = email['sender'];
      let subject = email['subject'];
      console.log(subject.split(" ", 1)[0]);
      if (subject.split(" ", 1)[0] != "Re:") {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;

      let body = `On ${email['timestamp']} ${email['sender']} wrote: ${email['body']}`;
      document.querySelector('#compose-body').value = body;
    }
    )

    if (!email['read']) {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    }
  });

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  const emails_view = document.querySelector('#emails-view');
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  emails_view.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails =>{
    console.log(emails);

    emails.forEach(email => {
      let element = document.createElement('div');
      
      if(mailbox === 'sent'){
        element.innerHTML = 
        `<div class="email-div"><span class="sender col-3"> <b>${email['recipients']}</b> </span>
        <span class="subject col-6"> ${email['subject']} </span>
        <span class="timestamp col-3"> ${email['timestamp']} </span></div>`;
      }
      else{
        element.className = email['read'] ? "read-emails" : "unread-emails";

        element.innerHTML = 
        `<div class="email-div"><span class="sender col-3"> <b>${email['sender']}</b> </span>
        <spandiv.className = email['read'] ? "email-list-item-read" : "email-list-item-unread"; class="subject col-6"> ${email['subject']} </span>
        <span class="timestamp col-3"> ${email['timestamp']} </span></div>`;
      }

      element.addEventListener('click', ()=> view_email(email['id'],mailbox));
      document.querySelector('#emails-view').appendChild(element);

    });
  })
  }