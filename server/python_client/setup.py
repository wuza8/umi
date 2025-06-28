from setuptools import setup, find_packages

setup(
    name='umiserver_python',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        'requests>=2.0.0'
    ],
    author='wuza8',
    author_email='rymcymcym100@gmail.com',
    description='A REST client for workflow communication.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/wuza8/umichan',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.8',
)