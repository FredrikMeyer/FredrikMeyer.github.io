---
layout: post
title: Using Emacs to backup a Raspberry Pi
date: 2023-02-26 20:33 +0100
tags: programming emacs
---

At home, I manage by smart lights (Philis Hue, Ikea Trådløs, etc) from a Raspberry Pi running the [Deconz](https://phoscon.de/en/raspbee2) Zigbee gateway.

A week ago, I suddenly couldn't turn off my kitchen lights - and I soon realized it was because the SD card on my Raspberry had stopped working. Resetting smart lights is a hassle, so I was very happy when I discovered that a simple backup script I had set up ages ago still worked (it backed up every night to Google Disk).

It turns out the the Deconz software only needs the [SQLite](https://www.sqlite.org/index.html) database to remember the connection information of the lights, so just copying my backup file to the configuration directory of Deconz was enough to reconnect to the lights (once I managed to actually install the Deconz software, but that is another story...).

This time I decided to use Amazon S3 to backup the Deconz database, since I'm more familiar with how S3 works, thanks to work experience.

## Step 1

Create a S3 bucket and an IAM user that is allowed to write files to this specific bucket. I use [AWS CDK](https://github.com/aws/aws-cdk) for this, but it should be quite easy to do it via the GUI as well.

After the user is created, go to the IAM console, and create access keys. They consist of an ID and a secret part.

## Step 2

Install the AWS CLI on your Raspberry Pi. I just did this:

```
> curl -O 'https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip'
> sudo aws/install
```

Check that it worked by typing e.g. `aws --help`.

Add your credentials by typing `aws configure` and follow the instructions.

## Step 3 - write the Elisp script

Of course I could have written a simple Bash script, but writing Bash feels like fixing the electrics at home without professions - it might work, or you might shoot yourself in the foot.

So I decided to try using Emacs, since I already installed Emacs on the Raspberry (again, because I'm more used to Emacs keybindings than anything else).

It required some Googling, but it turned out short and understandable:


```elisp
#!/usr/bin/emacs --script

(let* ((file-name "/deconz/zll.db")
       (target-name (concat
		    (format-time-string "%Y-%m-%d-%H_%M") "_zll.db"))
       (command (concat "aws s3 cp "
			file-name " "
			"s3://<S3-BUCKET-NAME>/"
			target-name)))
  (print "Starting upload.")
  (shell-command-to-string command)
  (print (concat "Uploaded file " target-name " to S3.")))
```

The script is quite simple. I define the relevant file names, and the the command to run (the `command` variable). Then I run the command.

By placing the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) at the top of the file, and running `chmod +x` on it (making it executable), one can run the script just by typing `./backup_deconz.el`

To not have everything in my home directory, I moved the script to `/usr/local/bin` and changed its owner to `root`.

## Making it run periodically

To make it run periodically, I googled how [crontab](https://man7.org/linux/man-pages/man5/crontab.5.html) works, and added this snippet in the crontab file (`sudo crontab -e`):

```
0 3 * * * /usr/local/bin/backup_deconz.el
```

Now the script will run every night at 03:00 AM.

## Conclusion

This is not exactly advanced Emacs usage, but I found it fun to be able to use Elisp instead of Bash when I had the chance.
