# Vanilla Starter for Enonic XP

This starter kit will set up an empty shell for your new Enonic app.

Once initiated, you'll have the bare minimum needed to create a new Enonic
application. You'll have all the folders set up, and can get
straight to creating what you're creating.


## Usage XP 7

You first need to install Enonic CLI. Then run the following commands to build and deploy it:

```bash
~ $ enonic project create
... Answer wizard question

~ $ cd <project-folder>
~/new-project $ enonic project deploy
```

Your brand new app should now be up and running on http://localhost:8080


## For XP 6.x users


### Initialize project

To get started, use the `toolbox` script to initiate your project:

```bash
~ $ mkdir new-project
~ $ cd new-project
~/new-project $ [$XP_INSTALL]/toolbox/toolbox.sh init-project -n com.example.name -r starter-vanilla
```

### Building your project

For best results, edit the gradle.properties file and check that the
xpVersion matches your XP version.

Build your project with ``./gradlew build``


## Compatibility

| Version | Min XP version |
|---------|----------------|
| Latest  | 7.12.1         |

## Changelog

### 1.8.0

Upgraded to XP 7.8.0

### 1.7.0

Upgraded to XP 7.6.0

### 1.6.0

Upgraded to XP 7.3.1

### 1.5.2

Proper commit and release for the 1.5.1 fix

### 1.5.1

Removed site.xml to avoid all apps to be treated as sites

### 1.5.0

Upgraded to Enonic XP7.

### 1.4.0
### 1.3.0

Upgraded to the new version of Gradle plugin.

### 1.2.0

Updated to work for Enonic XP 6.12.0.  Previous versions will not work after 6.11.x

### 1.1.0

* Added a default app icon and app description file. (These will only work for version 6.7.0 or newer)
* Updated this readme file.
* Updated the gradle wrapper.
