try:
    import MySQLdb  # mysqlclient
except ImportError:
    import pymysql
    pymysql.install_as_MySQLdb()
