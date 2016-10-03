'use strict'

require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'
import ReactDOM from 'react-dom'

let imageData = require('json!../images/imageData.json')

imageData = (function genImageURL(imageDataList) {
    imageDataList.forEach(function(singleImageData) {
        singleImageData.imageURL = require('../images/' + singleImageData.fileName)
    })
    return imageDataList
})(imageData)

function getRangeRandom(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}

function getDegreeRandom() {
    return (Math.random() > 0.5 ? '' : '-') + Math.floor(Math.random() * 30)
}

class Photo extends React.Component {
    constructor() {
        super()
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e) {
        e.stopPropagation()
        e.preventDefault()

        if (this.props.arrange.isCenter) {
            this.props.inverse()
        } else {
            this.props.center()
        }
    }

    render() {
        var styleObj = {}

        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos
        }

        if (this.props.arrange.rotate) {
            ['Moz', 'Ms', 'Webkit', ''].forEach(function(value) {
                styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)'
            }.bind(this))
        }

        if (this.props.arrange.isCenter) {
            styleObj.zIndex = 11
        }

        var imgFigureClassName = 'img-figure'
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : ''

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                        <p>
                            {this.props.data.description}
                        </p>
                    </div>
                </figcaption>
            </figure>
        )
    }
}

class ControllerUnit extends React.Component {
    constructor() {
        super()
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e) {
        e.stopPropagation()
        e.preventDefault()

        if (this.props.arrange.isCenter) {
            this.props.inverse()
        } else {
            this.props.center()
        }
    }

    render() {
        var controllerUnitClassName = 'controller-unit';
        if (this.props.arrange.isCenter) {
            controllerUnitClassName += ' is-center'
            if (this.props.arrange.isInverse) {
                controllerUnitClassName += ' is-inverse'
            }
        }
        return (
            <span className={controllerUnitClassName} onClick={this.handleClick}></span>
        )
    }
}

class AppComponent extends React.Component {
    constructor() {
        super()
        this.constant = {
            centerPos: {
                left: 0,
                right: 0
            },
            horizontalPosRange: {
                leftSecX: [0, 0],
                rightSecX: [0, 0],
                y: [0, 0]
            },
            verticalPosRange: {
                x: [0, 0],
                topY: [0, 0]
            }
        }
        this.state = {
            imgsArrangeArr: [
            ]
        }
    }

    inverse(index) {
        return function() {
            var imgsArrangeArr = this.state.imgsArrangeArr
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse

            this.setState({
                imgsArrangeArr: imgsArrangeArr
            })
        }.bind(this)
    }

    rearrange(centerIndex) {
        var imgsArrangeArr = this.state.imgsArrangeArr,
            constant = this.constant,
            centerPos = constant.centerPos,
            horizontalPosRange = constant.horizontalPosRange,
            verticalPosRange = constant.verticalPosRange,
            horizontalPosRangeLeftSecX = horizontalPosRange.leftSecX,
            horizontalPosRangeRightSecX = horizontalPosRange.rightSecX,
            horizontalPosRangeY = horizontalPosRange.y,
            verticalPosRangeTopY = verticalPosRange.topY,
            verticalPosRangeX = verticalPosRange.x,

            imgsArrangeTopArr = [],
            topImgNum = Math.floor(Math.random() * 2),
            topImgSpliceIndex = 0,

            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1)

        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        }

        while (topImgSpliceIndex === centerIndex) {
            topImgSpliceIndex = Math.floor(Math.random() * imgsArrangeArr.length - topImgNum)
        }
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum)

        imgsArrangeTopArr.forEach(function(value, index) {
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandom(verticalPosRangeTopY[0], verticalPosRangeTopY[1]),
                    left: getRangeRandom(verticalPosRangeX[0], verticalPosRangeX[1])
                },
                rotate: getDegreeRandom(),
                isCenter: false
            }
        })

        for (var i = 0, len = imgsArrangeArr.length; i < len; i++) {
            var horizontalPosRangeLORX = null

            if (i < len / 2) {
                horizontalPosRangeLORX = horizontalPosRangeLeftSecX
            } else {
                horizontalPosRangeLORX = horizontalPosRangeRightSecX
            }

            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(horizontalPosRangeY[0], horizontalPosRangeY[1]),
                    left: getRangeRandom(horizontalPosRangeLORX[0], horizontalPosRangeLORX[1])
                },
                rotate: getDegreeRandom(),
                isCenter: false
            }
        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0])
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0])

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        })
    }

    center(index) {
        return function() {
            this.rearrange(index)
        }.bind(this)
    }

    componentDidMount() {
        var stageDOM = this.refs.stage,
            stageWidth = stageDOM.scrollWidth,
            stageHeight = stageDOM.scrollHeight,
            halfStageWidth = Math.floor(stageWidth / 2),
            halfStageHeight = Math.floor(stageHeight / 2)

        var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgWidth = imgFigureDOM.scrollWidth,
            imgHeight = imgFigureDOM.scrollHeight,
            halfImgWidth = Math.floor(imgWidth / 2),
            halfImgHeight = Math.floor(imgHeight / 2)

        this.constant.centerPos = {
            left: halfStageWidth - halfImgWidth,
            top: halfStageHeight - halfImgHeight
        }

        this.constant.horizontalPosRange.leftSecX[0] = -halfImgWidth
        this.constant.horizontalPosRange.leftSecX[1] = halfStageWidth - halfImgWidth * 3
        this.constant.horizontalPosRange.rightSecX[0] = halfStageWidth + halfImgWidth
        this.constant.horizontalPosRange.rightSecX[1] = stageWidth - halfImgWidth
        this.constant.horizontalPosRange.y[0] = -halfImgHeight
        this.constant.horizontalPosRange.y[1] = stageHeight - halfImgHeight

        this.constant.verticalPosRange.topY[0] = -halfImgHeight
        this.constant.verticalPosRange.topY[1] = halfStageHeight - halfImgHeight * 3
        this.constant.verticalPosRange.x[0] = halfStageWidth - imgWidth
        this.constant.verticalPosRange.x[1] = halfStageWidth

        this.rearrange(0)
    }

    render() {
        var photos = [],
            controllerUnits = []

        imageData.forEach(function(value, index) {
            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0,
                    isInverse: false,
                    isCenter: false
                }
            }
            photos.push(<Photo key={index} data={value} ref={'imgFigure' + index}
                arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)}
                center={this.center(index)} />)

            controllerUnits.push(<ControllerUnit key={index}
                arrange={this.state.imgsArrangeArr[index]}
                inverse={this.inverse(index)} center={this.center(index)} />)
        }.bind(this))

        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {photos}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>
        )
    }
}

AppComponent.defaultProps = {
}

export default AppComponent
