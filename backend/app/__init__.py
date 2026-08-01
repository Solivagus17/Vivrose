from flask import Flask
from flask_cors import CORS

from .config import Config
from .db import db
from .routes import ALL_BLUEPRINTS


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DATABASE_URL']

    # Supabase / PostgreSQL pool resilience options
    db_uri = str(app.config.get('SQLALCHEMY_DATABASE_URI') or '').lower()
    engine_options = {'pool_pre_ping': True}
    if 'postgres' in db_uri:
        engine_options.update({
            'pool_recycle': 280,
            'pool_size': 10,
            'max_overflow': 20,
        })
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options

    db.init_app(app)
    CORS(app, resources={r'/api/*': {'origins': '*'}})

    for bp in ALL_BLUEPRINTS:
        app.register_blueprint(bp)

    @app.errorhandler(404)
    def not_found(_):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def server_error(error):
        return {'error': f'Internal server error: {error}'}, 500

    return app
