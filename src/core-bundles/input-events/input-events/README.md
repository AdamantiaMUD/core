# Login event flow

                      intro (MOTD)
                        |
      (new account) __login__  (existing account)
                   /         \
     create-account           password----------------------
        |                            |                     |

change-password choose-character change-password
| |
create-character |
| |
character-name-check |
| |
finish-character |
|\***\*\*\*\*\*\*\***\_\_\***\*\*\*\*\*\*\***done (add player to game world)
|
commands
(command prompt, all player input after login goes through this event)
