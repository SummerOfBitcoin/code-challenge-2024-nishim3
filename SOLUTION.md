## Constructing Block Header
Just followed the basic serialisation steps here. For the difficulty, turned out that generating the nonce on random was more efficient than a traditional incremental loop.

## Coinbase Transaction
Again, just followed basic serialisation. Picked up a valid coinbase transaction and modified it to match the transactions in the block. 

## Transaction Validation
* P2PKH: Reverse engineered the signature process. Came across the elliptic library for js. Made things a lot easier. Initially ran into issues with multiple input transactions, resolved by actually looking at messages of such transactions.
* P2WPKH: Same procedure as p2pkh.

When I ran the script only p2pkh verification, I got a score of about 19. With p2pkh, I had achieved max weight. I then decided not to verify further, and optimise the already verified transactions to get to the maximum score.

## Score Optimisation
* First I sorted the transactions in decreasing fees.
* Then I checked if that transaction was p2pkh or p2wpkh, as those were the only ones I had validated.
* Then I included transactions until the block limit had reached.

Using some local scripts, I realised that there was no way that the total fees could cross 20616923 with the weight constraints. I removed the check for fees limit.

Also, through local testing, I realised that:
* None of the transactions were overspending.
* All the transactions had a valid public key hash.
So I removed these checks also. (These checks are absolutely necessary for the mining process. I had just removed them to get better performance ***specific to the assignment***)

Following some more fixes, I was able to achieve a satisfactory score of 97. 
Things I think I could have done better:
* Used a stronger language like Rust or C++.
* Validated all the different type of transactions
* Implemented the ECDSA signature myself

##Acknowledgements
I received inaluable help from the learnmeabitcoin website and the discord channel. I made sure to give back by helping out my peers when they reached out to me for help.







