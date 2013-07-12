function Matrix2D(matrix) {
    if(!matrix) 
        matrix = [
            [1, 0, 0 ],
            [0, 1, 0 ],
            [0, 0, 1 ]
        ];
    this.assign(matrix);
}
Matrix2D.prototype[2] = [0, 0, 1];
Matrix2D.prototype.assign=function(matrix){
    if(!this[0]) this[0] = [];
    this[0][0] = matrix[0][0], this[0][1] = matrix[0][1], this[0][2] = matrix[0][2];
    if(!this[1]) this[1] = [];
    this[1][0] = matrix[1][0], this[1][1] = matrix[1][1], this[1][2] = matrix[1][2];
    return this;
};
Matrix2D.prototype.mul = function(matrix) {
    this[0] = [this[0][0] * matrix[0][0] + this[0][1] * matrix[1][0] + this[0][2] * matrix[2][0],
        this[0][0] * matrix[0][1] + this[0][1] * matrix[1][1] + this[0][2] * matrix[2][1],
        this[0][0] * matrix[0][2] + this[0][1] * matrix[1][2] + this[0][2] * matrix[2][2]];

    this[1] = [this[1][0] * matrix[0][0] + this[1][1] * matrix[1][0] + this[1][2] * matrix[2][0],
        this[1][0] * matrix[0][1] + this[1][1] * matrix[1][1] + this[1][2] * matrix[2][1],
        this[1][0] * matrix[0][2] + this[1][1] * matrix[1][2] + this[1][2] * matrix[2][2]];
    return this;
}
Matrix2D.prototype.rotate=function(rad){
    with(Math)
        this.mul([
            [cos(rad),-sin(rad),0],
            [sin(rad),cos(rad),0],
            [0,0,1]
        ]);
    return this;
};
Matrix2D.prototype.scale=function(sx,sy){
    this.mul([
        [sx,0,0],
        [0,sy,0],
        [0,0,1]
    ]);
    return this;
};
Matrix2D.prototype.skew=function(sx,sy){
    with(Math)
        this.mul([
            [0,tan(sx),0],
            [tan(sy),0,0],
            [0,0,1]
        ]);
    return this;
};
Matrix2D.prototype.translate=function(tx,ty){
    this.mul([
        [1,0,tx],
        [0,1,ty],
        [0,0,1]
    ]);
    return this;
};
Matrix2D.prototype.at=function(x,y){
    var me = this;
    return {
        rotate:function(rad){
            me.translate(-x,-y);
            me.rotate(rad);
            me.translate(x,y);
            return me;
        },
        scale:function(sx,sy){
            me.translate(-x,-y);
            me.scale(sx,sy);
            me.translate(x,y);
            return me;
        },
        skew:function(sx,sy){
            me.translate(-x,-y);
            me.skew(sx,sy);
            me.translate(x,y);
            return me;
        }
    }
};
Matrix2D.prototype.toString=function(){
    return [
        [this[0][0],this[0][1],this[0][2]].join("\t"),
        [this[1][0],this[1][1],this[1][2]].join("\t"),
        [this[2][0],this[2][1],this[2][2]].join("\t")
    ].join("\n")
};

