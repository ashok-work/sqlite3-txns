var express = require('express');
const db = require('../db');
var router = express.Router();

function generateRandomAccountNumber() {
  const min = 1000000000; // Minimum 10-digit account number
  const max = 9999999999; // Maximum 10-digit account number

  // Generate a random number between min and max (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* GET users listing. */
router.get('/', async function (req, res, next) {
  // res.send('respond with a resource');
  const trx = await db.transaction();
  try {
    // Fetch a random account number
    const randomAccount = await trx('accounts')
      .select('account_no') // Select the account_no column
      .orderByRaw('RANDOM()') // Use SQLite's RANDOM() function to randomize order
      .first(); // Limit the result to one record

    let account_no = null;
    if (randomAccount) {
      account_no = randomAccount.account_no;
    } else {
      // Commit the transaction
      await trx.commit();
      return res.json({ msg: 'Transaction committed successfully.' })
    }

    // Update balance for account
    console.log("account_no", account_no);
    await trx('accounts')
      .where({ account_no })
      .decrement('balance', 10);

    // Commit the transaction
    await trx.commit();
    console.log('Transaction committed successfully.');
    res.json({ msg: 'Transaction committed successfully.' })
  } catch (err) {
    // Rollback the transaction
    await trx.rollback();
    console.error('Transaction failed. Rolling back...', err);
    res.json(err);
  } finally {
    // Close the connection
    // await db.destroy();
  }
});

/* GET users listing. */
router.get('/create-accounts', async function (req, res, next) {
  // res.send('respond with a resource');
  const trx = await db.transaction();
  try {
    let account_no = generateRandomAccountNumber();
    // Insert into accounts
    await trx('accounts').insert({ account_no, balance: 2000 });
    // Commit the transaction
    await trx.commit();
    console.log('Transaction committed successfully.', account_no);
    res.json({ msg: 'Transaction committed successfully.' })
  } catch (err) {
    // Rollback the transaction
    await trx.rollback();
    console.error('Transaction failed. Rolling back...', err);
    res.json(err);
  } finally {
    // Close the connection
    // await db.destroy();
  }
});

router.get('/accounts', async function (req, res, next) {
  try {
    const result = await db.select('*', db.raw("datetime(created_at, 'localtime') as created_at"), db.raw("datetime(updated_at, 'localtime') as updated_at")).table('accounts').limit(32).orderBy('account_no', 'desc');
    res.json(result)
  } catch (err) {
    res.json(err);
  }
});

router.get('/total-accounts', async function (req, res, next) {
  try {
    // Get the total number of accounts
    const result = await db('accounts').count('account_no as total');
    console.log(result);
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
