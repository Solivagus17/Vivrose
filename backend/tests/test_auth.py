from conftest import auth


def test_me_requires_token(client):
    res = client.get('/api/auth/me')
    assert res.status_code == 401


def test_me_provisions_household_once(client):
    res = client.get('/api/auth/me', headers=auth('user-a'))
    assert res.status_code == 200
    body = res.get_json()
    assert body['user']['id'] == 'user-a'
    assert body['householdId']

    second = client.get('/api/auth/me', headers=auth('user-a'))
    assert second.get_json()['householdId'] == body['householdId']


def test_two_users_get_separate_households(client):
    a = client.get('/api/auth/me', headers=auth('user-x')).get_json()['householdId']
    b = client.get('/api/auth/me', headers=auth('user-y')).get_json()['householdId']
    assert a != b
